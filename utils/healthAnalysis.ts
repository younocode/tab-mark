import type { BookmarkNode, DuplicateGroup, EmptyFolder } from "../types";
import { flattenBookmarks, buildParentPathLookup } from "./bookmarks";

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    let path = u.pathname;
    if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
    return `${u.origin}${path}${u.search}`;
  } catch {
    return url;
  }
}

export function findEmptyFolders(tree: BookmarkNode[]): EmptyFolder[] {
  const results: EmptyFolder[] = [];
  function walk(nodes: BookmarkNode[], path: string) {
    for (const n of nodes) {
      if (n.url) continue;
      const currentPath = path ? `${path} › ${n.title}` : n.title;
      if (n.children && n.children.length === 0) {
        results.push({ id: n.id, title: n.title, path: currentPath });
      }
      if (n.children) walk(n.children, currentPath);
    }
  }
  walk(tree, "");
  return results;
}

export function findDuplicates(tree: BookmarkNode[]): DuplicateGroup[] {
  const all = flattenBookmarks(tree);
  const getPath = buildParentPathLookup(tree);
  const urlMap = new Map<string, { id: string; title: string; url: string }[]>();
  for (const bm of all) {
    if (!bm.url) continue;
    const norm = normalizeUrl(bm.url);
    if (!urlMap.has(norm)) urlMap.set(norm, []);
    urlMap.get(norm)!.push({ id: bm.id, title: bm.title, url: bm.url });
  }
  const dups: DuplicateGroup[] = [];
  for (const [url, items] of urlMap) {
    if (items.length > 1) {
      dups.push({
        url,
        title: items[0].title,
        bookmarkIds: items.map((i) => i.id),
        paths: items.map((i) => i.url),
        folderPaths: items.map((i) => getPath(i.id)),
      });
    }
  }
  return dups;
}
