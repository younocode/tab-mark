import { create } from "zustand";
import type { Tab } from "../types";

interface TabStore {
  tabs: Tab[];
  init: () => Promise<void>;
  closeTab: (tabId: number) => Promise<void>;
  activateTab: (tabId: number, windowId: number) => Promise<void>;
}

export const useTabStore = create<TabStore>((setState) => ({
  tabs: [],

  init: async () => {
    const chromeTabs = await chrome.tabs.query({});
    setState({ tabs: chromeTabs as Tab[] });

    chrome.tabs.onCreated.addListener((tab) => {
      setState((s) => ({ tabs: [...s.tabs, tab as Tab] }));
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      setState((s) => ({ tabs: s.tabs.filter((t) => t.id !== tabId) }));
    });

    chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
      setState((s) => ({
        tabs: s.tabs.map((t) =>
          t.id === tabId ? { ...t, ...changeInfo } : t,
        ),
      }));
    });

    chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
      setState((s) => ({
        tabs: s.tabs.map((t) =>
          t.id === tabId ? { ...t, index: moveInfo.toIndex } : t,
        ),
      }));
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      setState((s) => ({
        tabs: s.tabs.map((t) =>
          t.windowId === activeInfo.windowId
            ? { ...t, active: t.id === activeInfo.tabId }
            : t,
        ),
      }));
    });
  },

  closeTab: async (tabId) => {
    await chrome.tabs.remove(tabId);
  },

  activateTab: async (tabId, windowId) => {
    await chrome.tabs.update(tabId, { active: true });
    await chrome.windows.update(windowId, { focused: true });
  },
}));
