import { create } from "zustand";
import type { BookmarkNode } from "../types";

interface BookmarkStore {
  tree: BookmarkNode[];
  initialized: boolean;
  init: () => Promise<void>;
  updateBookmark: (
    id: string,
    changes: { title?: string; url?: string },
  ) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  removeTree: (id: string) => Promise<void>;
  createFolder: (parentId: string, title: string) => Promise<void>;
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

  updateBookmark: async (id, changes) => {
    await chrome.bookmarks.update(id, changes);
  },

  removeBookmark: async (id) => {
    await chrome.bookmarks.remove(id);
  },

  removeTree: async (id) => {
    await chrome.bookmarks.removeTree(id);
  },

  createFolder: async (parentId, title) => {
    await chrome.bookmarks.create({ parentId, title });
  },
}));
