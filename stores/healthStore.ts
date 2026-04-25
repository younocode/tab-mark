import { create } from "zustand";
import type { HealthResult, DuplicateGroup } from "../types";

interface HealthStore {
  scanning: boolean;
  progress: { checked: number; total: number };
  deadLinks: HealthResult[];
  duplicates: DuplicateGroup[];
  tab: "dead" | "duplicates";

  setTab: (tab: "dead" | "duplicates") => void;
  setScanning: (scanning: boolean) => void;
  setProgress: (progress: { checked: number; total: number }) => void;
  setDeadLinks: (deadLinks: HealthResult[]) => void;
  setDuplicates: (duplicates: DuplicateGroup[]) => void;
  removeDeadLink: (id: string) => void;
  removeDuplicate: (groupUrl: string, id: string) => void;
  removeAllDead: () => void;
}

export const useHealthStore = create<HealthStore>((setState, getState) => ({
  scanning: false,
  progress: { checked: 0, total: 0 },
  deadLinks: [],
  duplicates: [],
  tab: "dead",

  setTab: (tab) => setState({ tab }),
  setScanning: (scanning) => setState({ scanning }),
  setProgress: (progress) => setState({ progress }),
  setDeadLinks: (deadLinks) => setState({ deadLinks }),
  setDuplicates: (duplicates) => setState({ duplicates }),

  removeDeadLink: (id) => {
    setState({ deadLinks: getState().deadLinks.filter((d) => d.bookmarkId !== id) });
  },

  removeDuplicate: (groupUrl, id) => {
    const updated = getState()
      .duplicates.map((g) => {
        if (g.url !== groupUrl) return g;
        const idx = g.bookmarkIds.indexOf(id);
        if (idx === -1) return g;
        return {
          ...g,
          bookmarkIds: g.bookmarkIds.filter((_, i) => i !== idx),
          paths: g.paths.filter((_, i) => i !== idx),
          folderPaths: g.folderPaths.filter((_, i) => i !== idx),
        };
      })
      .filter((g) => g.bookmarkIds.length > 1);
    setState({ duplicates: updated });
  },

  removeAllDead: () => setState({ deadLinks: [] }),
}));

// Global listener so progress updates are received even when HealthView is unmounted
chrome.runtime.onMessage.addListener((message: { type: string; checked: number; total: number }) => {
  if (message.type === "HEALTH_PROGRESS") {
    useHealthStore.getState().setProgress({ checked: message.checked, total: message.total });
  }
});
