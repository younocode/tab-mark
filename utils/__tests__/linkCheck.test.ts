import { describe, it, expect, vi } from "vitest";
import {
  classifyNetworkError,
  httpStatusToLinkStatus,
  severityOf,
  isValidHttpUrl,
  isSoft404,
  parseRetryAfter,
  retryDelay,
  isBotProtectionResponse,
  DomainThrottle,
  getHost,
} from "../linkCheck";

describe("classifyNetworkError", () => {
  it("classifies AbortError as timeout", () => {
    const e = new DOMException("signal timed out", "AbortError");
    expect(classifyNetworkError(e)).toBe("timeout");
  });

  it("classifies SSL TypeError as ssl_error", () => {
    expect(classifyNetworkError(new TypeError("SSL certificate error"))).toBe("ssl_error");
    expect(classifyNetworkError(new TypeError("TLS handshake failed"))).toBe("ssl_error");
    expect(classifyNetworkError(new TypeError("invalid cert"))).toBe("ssl_error");
  });

  it("classifies DNS TypeError as dns_error", () => {
    expect(classifyNetworkError(new TypeError("DNS resolution failed"))).toBe("dns_error");
    expect(classifyNetworkError(new TypeError("getaddrinfo ENOTFOUND"))).toBe("dns_error");
    expect(classifyNetworkError(new TypeError("Could not resolve host"))).toBe("dns_error");
    expect(classifyNetworkError(new TypeError("host not found"))).toBe("dns_error");
  });

  it("classifies connection refused as dead", () => {
    expect(classifyNetworkError(new TypeError("Connection refused"))).toBe("dead");
    expect(classifyNetworkError(new TypeError("Connection reset"))).toBe("dead");
  });

  it("classifies CORS errors as forbidden", () => {
    expect(classifyNetworkError(new TypeError("CORS error"))).toBe("forbidden");
    expect(classifyNetworkError(new TypeError("opaque response"))).toBe("forbidden");
  });

  it("returns unknown for unrecognized errors", () => {
    expect(classifyNetworkError(new Error("something weird"))).toBe("unknown");
    expect(classifyNetworkError("string error")).toBe("unknown");
  });
});

describe("httpStatusToLinkStatus", () => {
  it("maps 404 and 410 to dead", () => {
    expect(httpStatusToLinkStatus(404)).toBe("dead");
    expect(httpStatusToLinkStatus(410)).toBe("dead");
  });

  it("maps 401 and 403 to forbidden", () => {
    expect(httpStatusToLinkStatus(401)).toBe("forbidden");
    expect(httpStatusToLinkStatus(403)).toBe("forbidden");
  });

  it("maps 429 to rate_limited", () => {
    expect(httpStatusToLinkStatus(429)).toBe("rate_limited");
  });

  it("maps 500+ to server_error", () => {
    expect(httpStatusToLinkStatus(500)).toBe("server_error");
    expect(httpStatusToLinkStatus(502)).toBe("server_error");
    expect(httpStatusToLinkStatus(503)).toBe("server_error");
  });

  it("returns unknown for unhandled codes", () => {
    expect(httpStatusToLinkStatus(301)).toBe("unknown");
    expect(httpStatusToLinkStatus(200)).toBe("unknown");
  });
});

describe("severityOf", () => {
  it('returns "dead" for dead/soft404/dns_error/invalid', () => {
    expect(severityOf("dead")).toBe("dead");
    expect(severityOf("soft404")).toBe("dead");
    expect(severityOf("dns_error")).toBe("dead");
    expect(severityOf("invalid")).toBe("dead");
  });

  it('returns "warn" for other statuses', () => {
    expect(severityOf("timeout")).toBe("warn");
    expect(severityOf("ssl_error")).toBe("warn");
    expect(severityOf("server_error")).toBe("warn");
    expect(severityOf("rate_limited")).toBe("warn");
    expect(severityOf("forbidden")).toBe("warn");
    expect(severityOf("redirected")).toBe("warn");
    expect(severityOf("unknown")).toBe("warn");
  });
});

describe("isValidHttpUrl", () => {
  it("returns true for http/https", () => {
    expect(isValidHttpUrl("http://example.com")).toBe(true);
    expect(isValidHttpUrl("https://example.com")).toBe(true);
  });

  it("returns false for chrome:/javascript:/file: protocols", () => {
    expect(isValidHttpUrl("chrome://settings")).toBe(false);
    expect(isValidHttpUrl("javascript:void(0)")).toBe(false);
    expect(isValidHttpUrl("file:///tmp/test.html")).toBe(false);
  });

  it("returns false for invalid strings", () => {
    expect(isValidHttpUrl("not a url")).toBe(false);
    expect(isValidHttpUrl("")).toBe(false);
  });
});

describe("isSoft404", () => {
  it("detects 404 in title", () => {
    expect(isSoft404("<html><head><title>404 Not Found</title></head><body></body></html>")).toBe(true);
    expect(isSoft404("<html><head><title>Page not found</title></head><body></body></html>")).toBe(true);
  });

  it("detects body patterns in short pages", () => {
    expect(isSoft404("<html><head><title>Site</title></head><body>Page not found</body></html>")).toBe(true);
    expect(isSoft404("<html><head><title>Site</title></head><body>404 error page</body></html>")).toBe(true);
  });

  it("returns false for normal pages", () => {
    expect(isSoft404("<html><head><title>My Blog</title></head><body>Hello world content here</body></html>")).toBe(false);
  });

  it("detects Chinese 404 patterns", () => {
    expect(isSoft404("<html><head><title>页面不存在</title></head><body></body></html>")).toBe(true);
    expect(isSoft404("<html><head><title>找不到页面</title></head><body></body></html>")).toBe(true);
  });

  it("does not flag body patterns in long pages", () => {
    const longContent = "x".repeat(4000);
    expect(isSoft404(`<html><head><title>Blog</title></head><body>${longContent} page not found somewhere</body></html>`)).toBe(false);
  });
});

describe("parseRetryAfter", () => {
  it("returns null for null input", () => {
    expect(parseRetryAfter(null)).toBeNull();
  });

  it('parses numeric seconds "30"', () => {
    expect(parseRetryAfter("30")).toBe(30);
  });

  it('parses "1m30s" format', () => {
    expect(parseRetryAfter("1m30s")).toBe(90);
  });

  it('parses "30s" format', () => {
    expect(parseRetryAfter("30s")).toBe(30);
  });

  it("caps at 120 seconds", () => {
    expect(parseRetryAfter("300")).toBe(120);
    expect(parseRetryAfter("5m0s")).toBe(120);
  });

  it("parses HTTP date format", () => {
    const future = new Date(Date.now() + 60000).toUTCString();
    const result = parseRetryAfter(future);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(50);
    expect(result!).toBeLessThanOrEqual(120);
  });

  it("returns null for unparseable strings", () => {
    expect(parseRetryAfter("invalid")).toBeNull();
  });
});

describe("retryDelay", () => {
  it("returns approximately 1000-1500ms for attempt 0", () => {
    const delays = Array.from({ length: 20 }, () => retryDelay(0));
    for (const d of delays) {
      expect(d).toBeGreaterThanOrEqual(1000);
      expect(d).toBeLessThan(1500);
    }
  });

  it("increases exponentially with attempt", () => {
    const d0 = retryDelay(0);
    const d1 = retryDelay(1);
    const d2 = retryDelay(2);
    expect(d1).toBeGreaterThan(d0);
    expect(d2).toBeGreaterThan(d1);
  });
});

describe("isBotProtectionResponse", () => {
  it("returns true for status 999", () => {
    expect(isBotProtectionResponse(999, new Headers())).toBe(true);
  });

  it("returns true for 403 with cf-mitigated header", () => {
    const headers = new Headers({ "cf-mitigated": "challenge" });
    expect(isBotProtectionResponse(403, headers)).toBe(true);
  });

  it("returns false for plain 403", () => {
    expect(isBotProtectionResponse(403, new Headers())).toBe(false);
  });

  it("returns false for 200", () => {
    expect(isBotProtectionResponse(200, new Headers())).toBe(false);
  });
});

describe("getHost", () => {
  it("extracts hostname from URL", () => {
    expect(getHost("https://www.example.com/path")).toBe("www.example.com");
  });

  it("returns original string for invalid URL", () => {
    expect(getHost("not-a-url")).toBe("not-a-url");
  });
});

describe("DomainThrottle", () => {
  it("allows up to maxPerDomain concurrent requests", async () => {
    const throttle = new DomainThrottle(2);
    let running = 0;
    let maxRunning = 0;

    const makeJob = () => {
      let resolve!: () => void;
      const promise = new Promise<void>((r) => { resolve = r; });
      return { promise, resolve };
    };

    const job1 = makeJob();
    const job2 = makeJob();

    await throttle.acquire("a.com");
    running++;
    maxRunning = Math.max(maxRunning, running);
    throttle.track("a.com", job1.promise.then(() => { running--; }));

    await throttle.acquire("a.com");
    running++;
    maxRunning = Math.max(maxRunning, running);
    throttle.track("a.com", job2.promise.then(() => { running--; }));

    expect(maxRunning).toBe(2);

    job1.resolve();
    job2.resolve();
    await Promise.all([job1.promise, job2.promise]);
  });

  it("does not block different domains", async () => {
    const throttle = new DomainThrottle(1);

    let resolve!: () => void;
    const blockingJob = new Promise<void>((r) => { resolve = r; });

    await throttle.acquire("a.com");
    throttle.track("a.com", blockingJob);

    // Different domain should not be blocked
    await throttle.acquire("b.com");
    const bJob = Promise.resolve();
    throttle.track("b.com", bJob);

    resolve();
    await blockingJob;
  });
});
