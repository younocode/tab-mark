import { describe, it, expect } from "vitest";
import { normalizeUrl, findDuplicates } from "../healthAnalysis";
import { sampleTree, duplicateTree } from "../../test/fixtures/bookmarkTree";
import type { BookmarkNode } from "../../types";

describe("normalizeUrl", () => {
  it("removes utm parameters", () => {
    expect(normalizeUrl("https://example.com/page?utm_source=twitter&utm_medium=social")).toBe(
      "https://example.com/page",
    );
  });

  it("removes hash fragment", () => {
    expect(normalizeUrl("https://example.com/page#section")).toBe(
      "https://example.com/page",
    );
  });

  it("removes trailing slash (but preserves root /)", () => {
    expect(normalizeUrl("https://example.com/page/")).toBe("https://example.com/page");
    expect(normalizeUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("preserves non-utm parameters", () => {
    expect(normalizeUrl("https://example.com/search?q=test&page=2")).toBe(
      "https://example.com/search?q=test&page=2",
    );
  });

  it("returns invalid URL unchanged", () => {
    expect(normalizeUrl("not a url")).toBe("not a url");
  });

  it("strips all five utm variants", () => {
    const url =
      "https://example.com/page?utm_source=a&utm_medium=b&utm_campaign=c&utm_content=d&utm_term=e&keep=yes";
    expect(normalizeUrl(url)).toBe("https://example.com/page?keep=yes");
  });
});

describe("findDuplicates", () => {
  it("groups bookmarks by normalized URL", () => {
    const result = findDuplicates(duplicateTree);
    expect(result).toHaveLength(1);
    expect(result[0].bookmarkIds).toContain("10");
    expect(result[0].bookmarkIds).toContain("11");
  });

  it("only includes groups with 2+ items", () => {
    const result = findDuplicates(duplicateTree);
    for (const g of result) {
      expect(g.bookmarkIds.length).toBeGreaterThanOrEqual(2);
    }
    // "Unique" (id 12) should not appear
    const allIds = result.flatMap((g) => g.bookmarkIds);
    expect(allIds).not.toContain("12");
  });

  it("includes folder paths for each duplicate", () => {
    const result = findDuplicates(duplicateTree);
    expect(result[0].folderPaths).toHaveLength(result[0].bookmarkIds.length);
  });

  it("returns empty array when no duplicates", () => {
    const tree: BookmarkNode[] = [
      {
        id: "0",
        title: "",
        children: [
          { id: "1", title: "a", url: "https://a.com", parentId: "0" },
          { id: "2", title: "b", url: "https://b.com", parentId: "0" },
        ],
      },
    ];
    expect(findDuplicates(tree)).toEqual([]);
  });
});
