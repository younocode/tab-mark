import { create } from "zustand";
import type { BookmarkNode } from "../types";

interface BookmarkStore {
  tree: BookmarkNode[];
  initialized: boolean;
  init: () => Promise<void>;
}

export const useBookmarkStore = create<BookmarkStore>((setState, getState) => ({
  tree: [],
  initialized: false,

  init: async () => {
    if (getState().initialized) return;

    const tree = await chrome.bookmarks.getTree();
    setState({ tree: tree as BookmarkNode[], initialized: true });

    const refresh = async () => {
      const tree = await chrome.bookmarks.getTree();
      setState({ tree: tree as BookmarkNode[] });
    };

    chrome.bookmarks.onCreated.addListener(refresh);
    chrome.bookmarks.onRemoved.addListener(refresh);
    chrome.bookmarks.onChanged.addListener(refresh);
    chrome.bookmarks.onMoved.addListener(refresh);
  },
}));
