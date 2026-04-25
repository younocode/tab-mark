import { create } from "zustand";

const STORAGE_KEY = "tabmark_bookmark_tags";

interface TagStore {
  tags: Record<string, string[]>;
  init: () => Promise<void>;
  setTags: (bookmarkId: string, tags: string[]) => Promise<void>;
  addTag: (bookmarkId: string, tag: string) => Promise<void>;
  removeTag: (bookmarkId: string, tag: string) => Promise<void>;
  getAllTags: () => string[];
}

export const useTagStore = create<TagStore>((setState, getState) => ({
  tags: {},

  init: async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
      setState({ tags: result[STORAGE_KEY] as Record<string, string[]> });
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]?.newValue) {
        setState({ tags: changes[STORAGE_KEY].newValue as Record<string, string[]> });
      }
    });
  },

  setTags: async (bookmarkId, tags) => {
    const updated = { ...getState().tags, [bookmarkId]: tags };
    if (tags.length === 0) delete updated[bookmarkId];
    setState({ tags: updated });
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  },

  addTag: async (bookmarkId, tag) => {
    const current = getState().tags[bookmarkId] || [];
    if (current.includes(tag)) return;
    await getState().setTags(bookmarkId, [...current, tag]);
  },

  removeTag: async (bookmarkId, tag) => {
    const current = getState().tags[bookmarkId] || [];
    await getState().setTags(
      bookmarkId,
      current.filter((t) => t !== tag),
    );
  },

  getAllTags: () => {
    const all = new Set<string>();
    for (const tags of Object.values(getState().tags)) {
      tags.forEach((t) => all.add(t));
    }
    return Array.from(all).sort();
  },
}));
