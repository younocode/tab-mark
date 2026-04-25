export function bmDndId(chromeId: string): string {
  return `bm:${chromeId}`;
}

export function folderDndId(chromeId: string): string {
  return `folder:${chromeId}`;
}

export function parseDndId(dndId: string): {
  type: "bookmark" | "folder";
  chromeId: string;
} {
  const s = String(dndId);
  if (s.startsWith("bm:")) return { type: "bookmark", chromeId: s.slice(3) };
  if (s.startsWith("folder:"))
    return { type: "folder", chromeId: s.slice(7) };
  return { type: "bookmark", chromeId: s };
}
