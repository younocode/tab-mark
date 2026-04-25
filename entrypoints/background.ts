import type { UserPreferences, LinkStatus, HealthResult } from "../types";
import {
  classifyNetworkError,
  httpStatusToLinkStatus,
  severityOf,
  isValidHttpUrl,
  SKIP_PROTOCOLS,
  isSoft404,
  isHtmlResponse,
  DomainThrottle,
  getDomain,
  BROWSER_HEADERS,
  parseRetryAfter,
  retryDelay,
  isBotProtectionResponse,
} from "../utils/linkCheck";

const STORAGE_KEY = "tabmark_preferences";

const DEFAULTS: UserPreferences = {
  theme: "system",
  lang: "en",
  defaultView: "tabs",
  topSitesStyle: "big",
  topSitesCount: 8,
  tabsLayout: "grid",
  density: "compact",
  grouping: "chrome",
  groupHeader: "row",
};

interface HealthCheckRequest {
  type: "HEALTH_CHECK";
  urls: { bookmarkId: string; url: string; title: string }[];
}

let healthPaused = false;
let healthCancelled = false;
let healthAbortController: AbortController | null = null;

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      const existing = await chrome.storage.local.get(STORAGE_KEY);
      if (!existing[STORAGE_KEY]) {
        await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULTS });
      }
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "HEALTH_CHECK") {
      healthPaused = false;
      healthCancelled = false;
      runHealthCheck(message as HealthCheckRequest).then(sendResponse);
      return true;
    }
    if (message.type === "HEALTH_PAUSE") {
      healthPaused = true;
    }
    if (message.type === "HEALTH_RESUME") {
      healthPaused = false;
    }
    if (message.type === "HEALTH_CANCEL") {
      healthCancelled = true;
      healthPaused = false;
      healthAbortController?.abort();
    }
    if (message.type === "SEARCH") {
      handleSearch(message.query as string).then(sendResponse);
      return true;
    }
    if (message.type === "OPEN_URL") {
      chrome.tabs.create({ url: message.url });
    }
    if (message.type === "GET_FOLDERS") {
      getFolders().then(sendResponse);
      return true;
    }
    if (message.type === "SAVE_BOOKMARK") {
      chrome.bookmarks
        .create({
          parentId: message.parentId,
          title: message.title,
          url: message.url,
        })
        .then(() => sendResponse({ ok: true }));
      return true;
    }
  });
});

async function getFolders(): Promise<{ id: string; title: string }[]> {
  const tree = await chrome.bookmarks.getTree();
  const folders: { id: string; title: string }[] = [];
  function walk(nodes: chrome.bookmarks.BookmarkTreeNode[]) {
    for (const n of nodes) {
      if (!n.url && n.children) {
        if (n.title) folders.push({ id: n.id, title: n.title });
        walk(n.children);
      }
    }
  }
  walk(tree);
  return folders;
}

async function handleSearch(
  query: string,
): Promise<{ title: string; url: string; source: string }[]> {
  const q = query.toLowerCase();
  const results: { title: string; url: string; source: string }[] = [];

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (
      (tab.title?.toLowerCase().includes(q) ||
        tab.url?.toLowerCase().includes(q)) &&
      tab.url
    ) {
      results.push({ title: tab.title || "", url: tab.url, source: "tab" });
    }
    if (results.length >= 5) break;
  }

  const bookmarks = await chrome.bookmarks.search(query);
  for (const bm of bookmarks.slice(0, 5)) {
    if (bm.url) {
      results.push({ title: bm.title, url: bm.url, source: "bookmark" });
    }
  }

  if (chrome.history) {
    const history = await chrome.history.search({
      text: query,
      maxResults: 5,
    });
    for (const h of history) {
      if (h.url && h.title) {
        results.push({ title: h.title, url: h.url, source: "history" });
      }
    }
  }

  return results;
}

// ── Health check engine ──────────────────────────

const MAX_RETRIES = 2;
const FETCH_TIMEOUT = 15000;

const hostRateLimits = new Map<string, number>();

function getHostRateDelay(host: string): number {
  const expiry = hostRateLimits.get(host);
  if (!expiry) return 0;
  const remaining = expiry - Date.now();
  if (remaining <= 0) { hostRateLimits.delete(host); return 0; }
  return remaining;
}

async function runHealthCheck(
  req: HealthCheckRequest,
): Promise<HealthResult[]> {
  const results: HealthResult[] = [];
  const concurrency = 6;
  let idx = 0;
  let checked = 0;
  const total = req.urls.length;

  healthAbortController = new AbortController();
  const globalSignal = healthAbortController.signal;
  const throttle = new DomainThrottle();
  const urlCache = new Map<string, HealthResult | null>();

  let lastProgressSent = 0;
  const sendProgress = (force = false) => {
    const now = Date.now();
    if (!force && now - lastProgressSent < 250) return;
    lastProgressSent = now;
    chrome.runtime.sendMessage({ type: "HEALTH_PROGRESS", checked, total }).catch(() => {});
  };

  const sendResult = (result: HealthResult) => {
    chrome.runtime.sendMessage({ type: "HEALTH_RESULT", result }).catch(() => {});
  };

  const waitWhilePaused = async () => {
    while (healthPaused && !healthCancelled) {
      await new Promise((r) => setTimeout(r, 200));
    }
  };

  const timedFetch = async (url: string, method: string, followRedirect = true): Promise<Response> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
    const onGlobalAbort = () => controller.abort();
    globalSignal.addEventListener("abort", onGlobalAbort, { once: true });
    try {
      return await fetch(url, {
        method,
        headers: BROWSER_HEADERS,
        signal: controller.signal,
        redirect: followRedirect ? "follow" : "manual",
        credentials: "include",
      });
    } finally {
      clearTimeout(timer);
      globalSignal.removeEventListener("abort", onGlobalAbort);
    }
  };

  const readPartialBody = async (resp: Response, maxBytes: number): Promise<string> => {
    const reader = resp.body?.getReader();
    if (!reader) return "";
    const chunks: Uint8Array[] = [];
    let len = 0;
    try {
      while (len < maxBytes) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        chunks.push(value);
        len += value.length;
      }
    } finally {
      reader.cancel().catch(() => {});
    }
    if (chunks.length === 1) return new TextDecoder().decode(chunks[0]);
    const merged = new Uint8Array(len);
    let off = 0;
    for (const c of chunks) { merged.set(c, off); off += c.length; }
    return new TextDecoder().decode(merged);
  };

  const isRedirectToHomepage = (originalUrl: string, finalUrl: string): boolean => {
    try {
      const orig = new URL(originalUrl);
      const fin = new URL(finalUrl);
      if (orig.hostname !== fin.hostname) return false;
      return (fin.pathname === "/" || fin.pathname === "") && orig.pathname !== "/" && orig.pathname !== "";
    } catch { return false; }
  };

  type CheckResult = HealthResult | null;

  const checkUrl = async (item: { bookmarkId: string; url: string; title: string }): Promise<CheckResult> => {
    const makeResult = (status: LinkStatus, httpStatus?: number, finalUrl?: string): HealthResult => ({
      bookmarkId: item.bookmarkId,
      url: item.url,
      title: item.title,
      status,
      httpStatus,
      finalUrl,
      severity: severityOf(status),
    });

    let resp = await timedFetch(item.url, "HEAD");
    const headStatus = resp.status;

    if (isBotProtectionResponse(headStatus, resp.headers)) return null;

    if (headStatus >= 400) {
      const getResp = await timedFetch(item.url, "GET");

      if (isBotProtectionResponse(getResp.status, getResp.headers)) return null;

      if (getResp.status >= 200 && getResp.status < 400) {
        if (isHtmlResponse(getResp)) {
          const getHtml = await readPartialBody(getResp, 8000);
          if (isSoft404(getHtml)) {
            const finalUrl = getResp.url !== item.url ? getResp.url : undefined;
            return makeResult("soft404", getResp.status, finalUrl);
          }
        }
        return null;
      }
      resp = getResp;
    }

    const finalUrl = resp.url !== item.url ? resp.url : undefined;

    if (finalUrl && isRedirectToHomepage(item.url, finalUrl)) {
      return makeResult("soft404", resp.status, finalUrl);
    }

    if (resp.status === 429) {
      const delay = parseRetryAfter(resp.headers.get("retry-after"));
      if (delay !== null) {
        const host = getDomain(item.url);
        const expiry = Date.now() + delay * 1000;
        const existing = hostRateLimits.get(host) || 0;
        hostRateLimits.set(host, Math.max(existing, expiry));
      }
      return makeResult("rate_limited", 429, finalUrl);
    }

    if (resp.status >= 200 && resp.status < 400) {
      if (finalUrl && isHtmlResponse(resp)) {
        const getResp = await timedFetch(item.url, "GET");
        const html = await readPartialBody(getResp, 8000);
        if (isSoft404(html)) {
          return makeResult("soft404", resp.status, finalUrl);
        }
        return makeResult("redirected", resp.status, finalUrl);
      }
      if (finalUrl) {
        return makeResult("redirected", resp.status, finalUrl);
      }
      return null;
    }
    const linkStatus = httpStatusToLinkStatus(resp.status);
    return makeResult(linkStatus, resp.status, finalUrl);
  };

  const checkWithRetry = async (item: { bookmarkId: string; url: string; title: string }, domain: string): Promise<void> => {
    if (urlCache.has(item.url)) {
      const cached = urlCache.get(item.url)!;
      if (cached) {
        const r = { ...cached, bookmarkId: item.bookmarkId, title: item.title };
        results.push(r);
        sendResult(r);
      }
      return;
    }

    let lastResult: HealthResult | null = null;

    const hostDelay = getHostRateDelay(domain);
    if (hostDelay > 0) {
      await new Promise((r) => setTimeout(r, hostDelay));
    }

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (healthCancelled) return;
      if (attempt > 0) await new Promise((r) => setTimeout(r, retryDelay(attempt)));

      try {
        const result = await checkUrl(item);
        if (result === null) { urlCache.set(item.url, null); return; }
        if (result.status === "redirected") { urlCache.set(item.url, null); return; }

        if (result.severity === "dead") {
          urlCache.set(item.url, result);
          results.push(result);
          sendResult(result);
          return;
        }

        if (result.status === "rate_limited" && attempt < MAX_RETRIES) {
          const rlDelay = getHostRateDelay(domain) || 5000;
          await new Promise((r) => setTimeout(r, rlDelay));
          continue;
        }

        lastResult = result;
        if (attempt < MAX_RETRIES) continue;
      } catch (e) {
        if (healthCancelled) return;
        const status = classifyNetworkError(e);

        if (status === "dns_error" || status === "dead") {
          const r: HealthResult = {
            bookmarkId: item.bookmarkId, url: item.url, title: item.title,
            status, severity: "dead",
          };
          urlCache.set(item.url, r);
          results.push(r);
          sendResult(r);
          return;
        }

        lastResult = {
          bookmarkId: item.bookmarkId, url: item.url, title: item.title,
          status, severity: severityOf(status),
        };
        if (attempt < MAX_RETRIES) continue;
      }
    }

    if (lastResult) {
      urlCache.set(item.url, lastResult);
      results.push(lastResult);
      sendResult(lastResult);
    }
  };

  const checkOne = async () => {
    while (idx < req.urls.length && !healthCancelled) {
      await waitWhilePaused();
      if (healthCancelled) break;

      const i = idx++;
      const item = req.urls[i];

      if (SKIP_PROTOCOLS.some((p) => item.url.startsWith(p))) {
        checked++;
        sendProgress();
        continue;
      }

      if (!isValidHttpUrl(item.url)) {
        const r: HealthResult = { ...item, status: "invalid", severity: "dead" };
        results.push(r);
        sendResult(r);
        checked++;
        sendProgress();
        continue;
      }

      const domain = getDomain(item.url);
      await throttle.acquire(domain);
      if (healthCancelled) break;

      const job = (async () => {
        await checkWithRetry(item, domain);
        checked++;
        sendProgress();
      })();

      throttle.track(domain, job);
      await job;
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => checkOne()));
  sendProgress(true);
  healthAbortController = null;
  return results;
}
