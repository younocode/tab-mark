import { create } from "zustand";
import type { ReadingListEntry } from "../types";

interface ReadingListStore {
  entries: ReadingListEntry[];
  init: () => Promise<void>;
  markAsRead: (url: string) => Promise<void>;
  remove: (url: string) => Promise<void>;
}

export const useReadingListStore = create<ReadingListStore>((setState, getState) => ({
  entries: [],

  init: async () => {
    if (!chrome.readingList) return;
    const entries = await chrome.readingList.query({});
    setState({ entries: entries as ReadingListEntry[] });

    chrome.readingList.onEntryAdded?.addListener(async () => {
      const entries = await chrome.readingList.query({});
      setState({ entries: entries as ReadingListEntry[] });
    });
    chrome.readingList.onEntryRemoved?.addListener(async () => {
      const entries = await chrome.readingList.query({});
      setState({ entries: entries as ReadingListEntry[] });
    });
    chrome.readingList.onEntryUpdated?.addListener(async () => {
      const entries = await chrome.readingList.query({});
      setState({ entries: entries as ReadingListEntry[] });
    });
  },

  markAsRead: async (url) => {
    if (!chrome.readingList) return;
    await chrome.readingList.updateEntry({ url, hasBeenRead: true });
    const entries = await chrome.readingList.query({});
    setState({ entries: entries as ReadingListEntry[] });
  },

  remove: async (url) => {
    if (!chrome.readingList) return;
    await chrome.readingList.removeEntry({ url });
    const entries = await chrome.readingList.query({});
    setState({ entries: entries as ReadingListEntry[] });
  },
}));
