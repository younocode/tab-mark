import { create } from "zustand";
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

interface PreferenceStore extends UserPreferences {
  init: () => Promise<void>;
  set: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => void;
}

export const usePreferenceStore = create<PreferenceStore>((setState, getState) => ({
  ...DEFAULTS,

  init: async () => {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    const saved = result[STORAGE_KEY] as Partial<UserPreferences> | undefined;
    if (saved) {
      setState(saved);
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]?.newValue) {
        setState(changes[STORAGE_KEY].newValue);
      }
    });
  },

  set: (key, value) => {
    setState({ [key]: value });
    const state = getState();
    const prefs: UserPreferences = {
      theme: state.theme,
      lang: state.lang,
      topSitesStyle: state.topSitesStyle,
      tabsLayout: state.tabsLayout,
      density: state.density,
      grouping: state.grouping,
      groupHeader: state.groupHeader,
    };
    prefs[key] = value;
    chrome.storage.local.set({ [STORAGE_KEY]: prefs });
  },
}));

export { DEFAULTS as PREFERENCE_DEFAULTS };
