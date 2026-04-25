import { create } from "zustand";
import type { TabGroup } from "../types";

interface TabGroupStore {
  groups: TabGroup[];
  init: () => Promise<void>;
}

export const useTabGroupStore = create<TabGroupStore>((setState) => ({
  groups: [],

  init: async () => {
    const groups = await chrome.tabGroups.query({});
    setState({ groups: groups as TabGroup[] });

    chrome.tabGroups.onCreated.addListener((group) => {
      setState((s) => ({ groups: [...s.groups, group as TabGroup] }));
    });

    chrome.tabGroups.onRemoved.addListener((group) => {
      setState((s) => ({ groups: s.groups.filter((g) => g.id !== group.id) }));
    });

    chrome.tabGroups.onUpdated.addListener((group) => {
      setState((s) => ({
        groups: s.groups.map((g) =>
          g.id === group.id ? (group as TabGroup) : g,
        ),
      }));
    });
  },
}));
