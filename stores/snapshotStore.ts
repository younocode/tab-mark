import { create } from "zustand";
import type { Snapshot } from "../types";

const STORAGE_KEY = "tabmark_snapshots";

interface SnapshotStore {
  snapshots: Snapshot[];
  init: () => Promise<void>;
  save: (name: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
}

export const useSnapshotStore = create<SnapshotStore>((setState, getState) => ({
  snapshots: [],

  init: async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (result[STORAGE_KEY]) {
      setState({ snapshots: result[STORAGE_KEY] as Snapshot[] });
    }
  },

  save: async (name) => {
    const tabs = await chrome.tabs.query({});
    const groups = await chrome.tabGroups.query({});
    const groupMap = new Map(groups.map((g) => [g.id, g.title || ""]));

    const snapshot: Snapshot = {
      id: `snap-${Date.now()}`,
      name,
      createdAt: Date.now(),
      tabs: tabs.map((t) => ({
        url: t.url || "",
        title: t.title || "",
        groupName: t.groupId !== -1 ? groupMap.get(t.groupId) : undefined,
      })),
    };

    const updated = [snapshot, ...getState().snapshots];
    setState({ snapshots: updated });
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  },

  restore: async (id) => {
    const snapshot = getState().snapshots.find((s) => s.id === id);
    if (!snapshot) return;
    for (const tab of snapshot.tabs) {
      if (tab.url) await chrome.tabs.create({ url: tab.url });
    }
  },

  remove: async (id) => {
    const updated = getState().snapshots.filter((s) => s.id !== id);
    setState({ snapshots: updated });
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  },

  rename: async (id, name) => {
    const updated = getState().snapshots.map((s) =>
      s.id === id ? { ...s, name } : s,
    );
    setState({ snapshots: updated });
    await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  },
}));
