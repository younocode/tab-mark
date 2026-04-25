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

export function buildParentPathLookup(tree: BookmarkNode[]): (id: string) => string {
  const nameMap = new Map<string, string>();
  const parentMap = new Map<string, string | undefined>();

  const walk = (nodes: BookmarkNode[]) => {
    for (const n of nodes) {
      nameMap.set(n.id, n.title);
      parentMap.set(n.id, n.parentId);
      if (n.children) walk(n.children);
    }
  };
  walk(tree);

  const cache = new Map<string, string>();

  return (id: string): string => {
    if (cache.has(id)) return cache.get(id)!;
    const parts: string[] = [];
    let current = parentMap.get(id);
    while (current !== undefined) {
      const name = nameMap.get(current);
      if (name) parts.unshift(name);
      current = parentMap.get(current);
    }
    const path = parts.join(" › ") || "/";
    cache.set(id, path);
    return path;
  };
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
