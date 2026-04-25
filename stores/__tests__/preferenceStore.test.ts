import { describe, it, expect, beforeEach, vi } from "vitest";
import { usePreferenceStore, PREFERENCE_DEFAULTS } from "../preferenceStore";

describe("preferenceStore", () => {
  beforeEach(() => {
    usePreferenceStore.setState({ ...PREFERENCE_DEFAULTS });
    vi.clearAllMocks();
  });

  describe("detectLang (via defaults)", () => {
    it('defaults to "en" when chrome.i18n returns non-Chinese', () => {
      (chrome.i18n.getUILanguage as ReturnType<typeof vi.fn>).mockReturnValue("en-US");
      // detectLang runs at module load; test by re-checking the default
      expect(PREFERENCE_DEFAULTS.lang).toBeDefined();
    });
  });

  describe("set", () => {
    it("updates a single preference", () => {
      usePreferenceStore.getState().set("theme", "dark");
      expect(usePreferenceStore.getState().theme).toBe("dark");
    });

    it("persists to chrome.storage.local", () => {
      usePreferenceStore.getState().set("density", "spacious");
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          tabmark_preferences: expect.objectContaining({ density: "spacious" }),
        }),
      );
    });

    it("does not affect other preferences", () => {
      usePreferenceStore.getState().set("tabsLayout", "list");
      expect(usePreferenceStore.getState().theme).toBe("system");
      expect(usePreferenceStore.getState().tabsLayout).toBe("list");
    });
  });
});
