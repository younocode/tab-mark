import type { LinkStatus } from "../types";

export function classifyNetworkError(e: unknown): LinkStatus {
  if (e instanceof DOMException && e.name === "AbortError") return "timeout";
  if (e instanceof TypeError) {
    const msg = e.message.toLowerCase();
    if (msg.includes("ssl") || msg.includes("cert") || msg.includes("tls")) return "ssl_error";
    if (msg.includes("dns") || msg.includes("resolve") || msg.includes("getaddrinfo") || msg.includes("not found")) return "dns_error";
    if (msg.includes("refused") || msg.includes("reset")) return "dead";
    if (msg.includes("cors") || msg.includes("opaque")) return "forbidden";
  }
  return "unknown";
}

export function httpStatusToLinkStatus(code: number): LinkStatus {
  if (code === 404 || code === 410) return "dead";
  if (code === 401 || code === 403) return "forbidden";
  if (code === 429) return "rate_limited";
  if (code >= 500) return "server_error";
  return "unknown";
}

export const DEAD_STATUSES: Set<LinkStatus> = new Set(["dead", "soft404", "dns_error", "invalid"]);

export function severityOf(status: LinkStatus): "dead" | "warn" {
  return DEAD_STATUSES.has(status) ? "dead" : "warn";
}

export const SKIP_PROTOCOLS = ["chrome:", "chrome-extension:", "javascript:", "data:", "file:", "about:", "blob:"];

export function isValidHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export const SOFT_404_TITLE = /404|not\s*found|page\s*removed|页面.*(不存在|未找到|找不到)|找不到.*页面/i;

export const SOFT_404_BODY = [
  /page\s*(not|wasn.t)\s*found/i,
  /404\s*(error|not found|page)/i,
  /页面\s*(不存在|未找到|找不到)/,
  /无法找到.*页面/,
  /该页面已(删除|移除|下线)/,
];

export function isSoft404(html: string): boolean {
  const chunk = html.slice(0, 8000);
  const titleMatch = chunk.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch && SOFT_404_TITLE.test(titleMatch[1])) return true;
  const textOnly = chunk.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  if (textOnly.length < 3000 && SOFT_404_BODY.some((p) => p.test(textOnly))) return true;
  return false;
}

export function isHtmlResponse(resp: Response): boolean {
  const ct = resp.headers.get("content-type") || "";
  return ct.includes("text/html") || ct.includes("application/xhtml");
}

export class DomainThrottle {
  private queues = new Map<string, Promise<void>[]>();
  private maxPerDomain: number;

  constructor(maxPerDomain = 2) {
    this.maxPerDomain = maxPerDomain;
  }

  async acquire(domain: string): Promise<void> {
    const queue = this.queues.get(domain) || [];
    while (queue.length >= this.maxPerDomain) {
      await Promise.race(queue);
      const updated = this.queues.get(domain) || [];
      queue.length = 0;
      queue.push(...updated);
    }
  }

  track(domain: string, promise: Promise<void>) {
    const queue = this.queues.get(domain) || [];
    queue.push(promise);
    this.queues.set(domain, queue);
    promise.finally(() => {
      const q = this.queues.get(domain);
      if (q) {
        const idx = q.indexOf(promise);
        if (idx !== -1) q.splice(idx, 1);
        if (q.length === 0) this.queues.delete(domain);
      }
    });
  }
}

export function getHost(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

export const BROWSER_HEADERS: Record<string, string> = {
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Sec-Fetch-Dest": "document",
  "Sec-Fetch-Mode": "navigate",
  "Sec-Fetch-Site": "none",
  "Upgrade-Insecure-Requests": "1",
};

export const RETRYABLE_STATUSES: Set<number> = new Set([429, 500, 502, 503, 504]);

export function parseRetryAfter(header: string | null): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (!isNaN(seconds) && seconds > 0) return Math.min(seconds, 120);
  const m = header.match(/(?:(\d+)m)?(\d+)s/);
  if (m) return Math.min((Number(m[1] || 0) * 60) + Number(m[2]), 120);
  const date = Date.parse(header);
  if (!isNaN(date)) return Math.min(Math.max(0, (date - Date.now()) / 1000), 120);
  return null;
}

export function retryDelay(attempt: number): number {
  return Math.pow(2, attempt) * 1000 + Math.random() * 500;
}

export function isBotProtectionResponse(status: number, headers: Headers): boolean {
  if (status === 999) return true;
  if (status === 403 && headers.has("cf-mitigated")) return true;
  return false;
}
