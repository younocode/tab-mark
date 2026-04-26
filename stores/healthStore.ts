import { create } from "zustand";
import type { HealthResult, DuplicateGroup } from "../types";

interface HealthStore {
  scanning: boolean;
  paused: boolean;
  progress: { checked: number; total: number };
  deadLinks: HealthResult[];
  duplicates: DuplicateGroup[];

  setScanning: (scanning: boolean) => void;
  setPaused: (paused: boolean) => void;
  setProgress: (progress: { checked: number; total: number }) => void;
  setDeadLinks: (deadLinks: HealthResult[]) => void;
  addDeadLink: (link: HealthResult) => void;
  setDuplicates: (duplicates: DuplicateGroup[]) => void;
  removeDeadLink: (id: string) => void;
  removeDuplicate: (groupUrl: string, id: string) => void;
  removeAllDead: () => void;
}

export const useHealthStore = create<HealthStore>((setState, getState) => ({
  scanning: false,
  paused: false,
  progress: { checked: 0, total: 0 },
  deadLinks: [],
  duplicates: [],

  setScanning: (scanning) => setState({ scanning }),
  setPaused: (paused) => setState({ paused }),
  setProgress: (progress) => setState({ progress }),
  setDeadLinks: (deadLinks) => setState({ deadLinks }),
  addDeadLink: (link) => setState({ deadLinks: [...getState().deadLinks, link] }),
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

chrome.runtime.onMessage.addListener((message: any) => {
  if (message.type === "HEALTH_PROGRESS") {
    const store = useHealthStore.getState();
    if (store.scanning) {
      store.setProgress({ checked: message.checked, total: message.total });
    }
  }
  if (message.type === "HEALTH_RESULT") {
    const store = useHealthStore.getState();
    if (store.scanning) {
      const r = message.result;
      store.addDeadLink({ ...r, severity: r.severity || "dead" });
    }
  }
});
