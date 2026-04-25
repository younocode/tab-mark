import { describe, it, expect } from "vitest";
import {
  flattenBookmarks,
  getFolderById,
  buildParentPathLookup,
  getFolders,
} from "../bookmarks";
import { sampleTree, emptyTree } from "../../test/fixtures/bookmarkTree";

describe("flattenBookmarks", () => {
  it("returns empty array for empty tree", () => {
    expect(flattenBookmarks(emptyTree)).toEqual([]);
  });

  it("returns only nodes with url", () => {
    const result = flattenBookmarks(sampleTree);
    expect(result.every((n) => n.url !== undefined)).toBe(true);
  });

  it("flattens deeply nested bookmarks in DFS order", () => {
    const result = flattenBookmarks(sampleTree);
    const urls = result.map((n) => n.url);
    expect(urls).toEqual([
      "https://www.google.com",
      "https://github.com",
      "https://developer.mozilla.org",
      "https://stackoverflow.com",
      "https://code.visualstudio.com",
      "https://twitter.com",
    ]);
  });

  it("excludes folder nodes", () => {
    const result = flattenBookmarks(sampleTree);
    expect(result.find((n) => n.id === "12")).toBeUndefined();
    expect(result.find((n) => n.id === "14")).toBeUndefined();
  });
});

describe("getFolderById", () => {
  it("finds a root-level folder", () => {
    const result = getFolderById(sampleTree, "1");
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Bookmarks Bar");
  });

  it("finds a nested folder", () => {
    const result = getFolderById(sampleTree, "13");
    expect(result).not.toBeNull();
    expect(result!.title).toBe("Tools");
  });

  it("returns null for non-existent id", () => {
    expect(getFolderById(sampleTree, "999")).toBeNull();
  });

  it("returns null for empty tree", () => {
    expect(getFolderById(emptyTree, "1")).toBeNull();
  });
});

describe("buildParentPathLookup", () => {
  it("returns root path for top-level bookmark", () => {
    const lookup = buildParentPathLookup(sampleTree);
    // id "1" has parent "0" which has empty title — so path is "/"
    // id "10" has parent "1" (Bookmarks Bar), grandparent "0" (empty title)
    const path = lookup("10");
    expect(path).toBe("Bookmarks Bar");
  });

  it("returns nested path with › separator", () => {
    const lookup = buildParentPathLookup(sampleTree);
    const path = lookup("130");
    expect(path).toBe("Bookmarks Bar › Dev › Tools");
  });

  it("caches results for repeated lookups", () => {
    const lookup = buildParentPathLookup(sampleTree);
    const first = lookup("120");
    const second = lookup("120");
    expect(first).toBe(second);
    expect(first).toBe("Bookmarks Bar › Dev");
  });

  it("skips parents with empty title", () => {
    const lookup = buildParentPathLookup(sampleTree);
    const path = lookup("1");
    // parent is "0" with empty title, so it's skipped → "/"
    expect(path).toBe("/");
  });
});

describe("getFolders", () => {
  it("returns only folder nodes (no url + has children)", () => {
    const result = getFolders(sampleTree);
    expect(result.every((n) => !n.url && n.children !== undefined)).toBe(true);
  });

  it("includes nested folders", () => {
    const result = getFolders(sampleTree);
    const titles = result.map((n) => n.title);
    expect(titles).toContain("Dev");
    expect(titles).toContain("Tools");
    expect(titles).toContain("Empty Folder");
  });

  it("excludes bookmark nodes", () => {
    const result = getFolders(sampleTree);
    expect(result.find((n) => n.id === "10")).toBeUndefined();
  });

  it("returns empty for empty tree", () => {
    expect(getFolders(emptyTree)).toEqual([]);
  });
});
