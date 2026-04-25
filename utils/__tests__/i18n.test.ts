import { describe, it, expect } from "vitest";
import { getTranslations } from "../i18n";

describe("getTranslations", () => {
  it("returns English translations for 'en'", () => {
    const t = getTranslations("en");
    expect(t.appName).toBe("TabMark");
    expect(t.nav.tabs).toBe("Tabs");
  });

  it("returns Chinese translations for 'zh'", () => {
    const t = getTranslations("zh");
    expect(t.appName).toBe("TabMark");
    expect(t.nav.tabs).toBe("标签页");
  });

  it("falls back to English for unknown language", () => {
    const t = getTranslations("fr");
    expect(t.nav.tabs).toBe("Tabs");
  });

  it("has callable function-type translations", () => {
    const t = getTranslations("en");
    expect(t.tabs.groupCount(3)).toBe("3 tabs");
    expect(t.tabs.groupCount(1)).toBe("1 tab");
    expect(t.health.checked(5, 10)).toBe("5 of 10 checked");
  });

  it("has callable function-type translations in Chinese", () => {
    const t = getTranslations("zh");
    expect(t.tabs.groupCount(3)).toBe("3 个标签");
    expect(t.health.checked(5, 10)).toBe("已检查 5 / 10");
  });
});
