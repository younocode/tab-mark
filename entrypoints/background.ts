import type { UserPreferences } from "../types";

const STORAGE_KEY = "tabmark_preferences";

const DEFAULTS: UserPreferences = {
  theme: "system",
  lang: "en",
  topSitesStyle: "big",
  tabsLayout: "grid",
  density: "compact",
  grouping: "chrome",
  groupHeader: "row",
};

export default defineBackground(() => {
  chrome.runtime.onInstalled.addListener(async (details) => {
    if (details.reason === "install") {
      const existing = await chrome.storage.local.get(STORAGE_KEY);
      if (!existing[STORAGE_KEY]) {
        await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULTS });
      }
    }
  });
});
