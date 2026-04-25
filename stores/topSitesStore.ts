import { create } from "zustand";
import type { TopSite } from "../types";

interface TopSitesStore {
  sites: TopSite[];
  init: () => Promise<void>;
}

export const useTopSitesStore = create<TopSitesStore>((setState) => ({
  sites: [],

  init: async () => {
    const sites = await chrome.topSites.get();
    setState({ sites });
  },
}));
