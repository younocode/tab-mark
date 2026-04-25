import type { UserPreferences } from "../types";

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

interface HealthCheckResult {
  bookmarkId: string;
  url: string;
  title: string;
  status: number | "timeout" | "error";
}

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
      runHealthCheck(message as HealthCheckRequest).then(sendResponse);
      return true;
    }
    if (message.type === "SEARCH") {
      handleSearch(message.query as string).then(sendResponse);
      return true;
    }
    if (message.type === "OPEN_URL") {
      chrome.tabs.create({ url: message.url });
    }
  });
});

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

async function runHealthCheck(
  req: HealthCheckRequest,
): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = [];
  const concurrency = 5;
  let idx = 0;

  const checkOne = async () => {
    while (idx < req.urls.length) {
      const i = idx++;
      const item = req.urls[i];
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        const resp = await fetch(item.url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
        });
        clearTimeout(timeout);
        if (resp.status >= 400) {
          results.push({
            bookmarkId: item.bookmarkId,
            url: item.url,
            title: item.title,
            status: resp.status,
          });
        }
      } catch (e) {
        const isAbort =
          e instanceof DOMException && e.name === "AbortError";
        results.push({
          bookmarkId: item.bookmarkId,
          url: item.url,
          title: item.title,
          status: isAbort ? "timeout" : "error",
        });
      }
    }
  };

  await Promise.all(Array.from({ length: concurrency }, () => checkOne()));
  return results;
}
