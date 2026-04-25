import { describe, it, expect } from "vitest";
import { bmDndId, folderDndId, parseDndId } from "../dndIds";

describe("bmDndId", () => {
  it("adds bm: prefix", () => {
    expect(bmDndId("42")).toBe("bm:42");
  });
});

describe("folderDndId", () => {
  it("adds folder: prefix", () => {
    expect(folderDndId("7")).toBe("folder:7");
  });
});

describe("parseDndId", () => {
  it("parses bookmark id", () => {
    expect(parseDndId("bm:42")).toEqual({ type: "bookmark", chromeId: "42" });
  });

  it("parses folder id", () => {
    expect(parseDndId("folder:7")).toEqual({ type: "folder", chromeId: "7" });
  });

  it("falls back to bookmark for unknown prefix", () => {
    expect(parseDndId("unknown:99")).toEqual({
      type: "bookmark",
      chromeId: "unknown:99",
    });
  });

  it("falls back to bookmark for plain string", () => {
    expect(parseDndId("123")).toEqual({ type: "bookmark", chromeId: "123" });
  });
});
