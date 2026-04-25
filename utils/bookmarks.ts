import type { BookmarkNode } from "../types";

export function flattenBookmarks(tree: BookmarkNode[]): BookmarkNode[] {
  const out: BookmarkNode[] = [];
  const walk = (nodes: BookmarkNode[]) => {
    for (const n of nodes) {
      if (n.url) {
        out.push(n);
      }
      if (n.children) {
        walk(n.children);
      }
    }
  };
  walk(tree);
  return out;
}

export function getFolderById(
  tree: BookmarkNode[],
  id: string,
): BookmarkNode | null {
  for (const n of tree) {
    if (n.id === id) return n;
    if (n.children) {
      const found = getFolderById(n.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function getFolders(tree: BookmarkNode[]): BookmarkNode[] {
  const out: BookmarkNode[] = [];
  const walk = (nodes: BookmarkNode[]) => {
    for (const n of nodes) {
      if (!n.url && n.children) {
        out.push(n);
        walk(n.children);
      }
    }
  };
  walk(tree);
  return out;
}
