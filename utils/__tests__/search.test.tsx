import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { highlight, matchesQuery, getDomain } from "../search";

describe("matchesQuery", () => {
  it("returns true for empty query", () => {
    expect(matchesQuery("", "anything")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(matchesQuery("HELLO", "hello world")).toBe(true);
  });

  it("matches across multiple fields", () => {
    expect(matchesQuery("test", undefined, "no match", "testing")).toBe(true);
  });

  it("returns false when no field matches", () => {
    expect(matchesQuery("xyz", "abc", "def")).toBe(false);
  });

  it("handles undefined fields gracefully", () => {
    expect(matchesQuery("q", undefined, undefined)).toBe(false);
  });
});

describe("getDomain", () => {
  it("extracts hostname from url", () => {
    expect(getDomain("https://www.example.com/page")).toBe("example.com");
  });

  it("strips www prefix", () => {
    expect(getDomain("https://www.github.com")).toBe("github.com");
  });

  it("returns empty string for invalid url", () => {
    expect(getDomain("not-a-url")).toBe("");
  });

  it("keeps subdomains other than www", () => {
    expect(getDomain("https://docs.google.com")).toBe("docs.google.com");
  });
});

describe("highlight", () => {
  it("returns text unchanged for empty query", () => {
    const result = highlight("hello world", "");
    expect(result).toBe("hello world");
  });

  it("returns text unchanged when no match", () => {
    const result = highlight("hello world", "xyz");
    expect(result).toBe("hello world");
  });

  it("wraps matched portion with <mark>", () => {
    const { container } = render(<>{highlight("hello world", "world")}</>);
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark!.textContent).toBe("world");
    expect(container.textContent).toBe("hello world");
  });

  it("is case insensitive", () => {
    const { container } = render(<>{highlight("Hello World", "hello")}</>);
    const mark = container.querySelector("mark");
    expect(mark).not.toBeNull();
    expect(mark!.textContent).toBe("Hello");
  });
});
