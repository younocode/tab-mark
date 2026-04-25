import { create } from "zustand";
import type { HealthResult, DuplicateGroup } from "../types";

export interface EmptyFolder {
  id: string;
  title: string;
  path: string;
}

interface HealthStore {
  scanning: boolean;
  paused: boolean;
  progress: { checked: number; total: number };
  deadLinks: HealthResult[];
  duplicates: DuplicateGroup[];
  emptyFolders: EmptyFolder[];
  tab: "dead" | "duplicates" | "empty";

  setTab: (tab: "dead" | "duplicates" | "empty") => void;
  setScanning: (scanning: boolean) => void;
  setPaused: (paused: boolean) => void;
  setProgress: (progress: { checked: number; total: number }) => void;
  setDeadLinks: (deadLinks: HealthResult[]) => void;
  addDeadLink: (link: HealthResult) => void;
  setDuplicates: (duplicates: DuplicateGroup[]) => void;
  setEmptyFolders: (folders: EmptyFolder[]) => void;
  removeDeadLink: (id: string) => void;
  removeDuplicate: (groupUrl: string, id: string) => void;
  removeAllDead: () => void;
  removeDeadByStatus: (status: string) => void;
  removeEmptyFolder: (id: string) => void;
}

export const useHealthStore = create<HealthStore>((setState, getState) => ({
  scanning: false,
  paused: false,
  progress: { checked: 0, total: 0 },
  deadLinks: [],
  duplicates: [],
  emptyFolders: [],
  tab: "dead",

  setTab: (tab) => setState({ tab }),
  setScanning: (scanning) => setState({ scanning }),
  setPaused: (paused) => setState({ paused }),
  setProgress: (progress) => setState({ progress }),
  setDeadLinks: (deadLinks) => setState({ deadLinks }),
  addDeadLink: (link) => setState({ deadLinks: [...getState().deadLinks, link] }),
  setDuplicates: (duplicates) => setState({ duplicates }),
  setEmptyFolders: (folders) => setState({ emptyFolders: folders }),

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
  removeDeadByStatus: (status) => {
    setState({ deadLinks: getState().deadLinks.filter((d) => String(d.status) !== status) });
  },
  removeEmptyFolder: (id) => {
    setState({ emptyFolders: getState().emptyFolders.filter((f) => f.id !== id) });
  },
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
