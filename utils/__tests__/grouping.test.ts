import { describe, it, expect } from "vitest";
import {
  buildGroups,
  getDomainHue,
  getGroupColorClass,
} from "../grouping";
import type { Tab, TabGroup } from "../../types";

function makeTab(overrides: Partial<Tab> = {}): Tab {
  return {
    id: 1,
    windowId: 1,
    groupId: -1,
    url: "https://example.com",
    title: "Example",
    active: false,
    pinned: false,
    discarded: false,
    index: 0,
    ...overrides,
  };
}

function makeGroup(overrides: Partial<TabGroup> = {}): TabGroup {
  return {
    id: 1,
    title: "Group",
    color: "blue" as chrome.tabGroups.Color,
    collapsed: false,
    windowId: 1,
    ...overrides,
  };
}

describe("buildGroups", () => {
  it("delegates to chrome groups when mode is chrome", () => {
    const tabs = [makeTab({ groupId: 1 }), makeTab({ id: 2, groupId: -1 })];
    const groups = [makeGroup({ id: 1, title: "Work" })];
    const result = buildGroups(tabs, groups, "chrome");
    expect(result).toHaveLength(2);
    expect(result.find((g) => g.name === "Work")).toBeDefined();
    expect(result.find((g) => g.name === "Other")).toBeDefined();
  });

  it("delegates to domain groups when mode is domain", () => {
    const tabs = [
      makeTab({ url: "https://github.com/a" }),
      makeTab({ id: 2, url: "https://github.com/b" }),
      makeTab({ id: 3, url: "https://twitter.com" }),
    ];
    const result = buildGroups(tabs, [], "domain");
    expect(result[0].name).toBe("github.com");
    expect(result[0].tabs).toHaveLength(2);
  });
});

describe("buildChromeGroups (via buildGroups)", () => {
  it("groups tabs by groupId", () => {
    const g1 = makeGroup({ id: 10, title: "Dev" });
    const g2 = makeGroup({ id: 20, title: "Social" });
    const tabs = [
      makeTab({ groupId: 10 }),
      makeTab({ id: 2, groupId: 20 }),
      makeTab({ id: 3, groupId: 10 }),
    ];
    const result = buildGroups(tabs, [g1, g2], "chrome");
    const dev = result.find((g) => g.name === "Dev");
    expect(dev!.tabs).toHaveLength(2);
    const social = result.find((g) => g.name === "Social");
    expect(social!.tabs).toHaveLength(1);
  });

  it("puts ungrouped tabs (groupId -1) into Other", () => {
    const tabs = [makeTab({ groupId: -1 })];
    const result = buildGroups(tabs, [], "chrome");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Other");
  });
});

describe("buildDomainGroups (via buildGroups)", () => {
  it("groups by domain and strips www prefix", () => {
    const tabs = [
      makeTab({ url: "https://www.google.com/search" }),
      makeTab({ id: 2, url: "https://google.com/maps" }),
    ];
    const result = buildGroups(tabs, [], "domain");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("google.com");
    expect(result[0].tabs).toHaveLength(2);
  });

  it("sorts groups by count descending", () => {
    const tabs = [
      makeTab({ url: "https://a.com" }),
      makeTab({ id: 2, url: "https://b.com/1" }),
      makeTab({ id: 3, url: "https://b.com/2" }),
    ];
    const result = buildGroups(tabs, [], "domain");
    expect(result[0].name).toBe("b.com");
    expect(result[1].name).toBe("a.com");
  });

  it("handles invalid URLs as 'other'", () => {
    const tabs = [makeTab({ url: "not-a-url" })];
    const result = buildGroups(tabs, [], "domain");
    expect(result[0].name).toBe("other");
  });
});

describe("getDomainHue", () => {
  it("returns a number between 0 and 359", () => {
    const hue = getDomainHue("example.com");
    expect(hue).toBeGreaterThanOrEqual(0);
    expect(hue).toBeLessThan(360);
  });

  it("is deterministic for the same input", () => {
    expect(getDomainHue("github.com")).toBe(getDomainHue("github.com"));
  });

  it("produces different hues for different domains", () => {
    expect(getDomainHue("a.com")).not.toBe(getDomainHue("z.com"));
  });
});

describe("getGroupColorClass", () => {
  it("returns gd-grey for undefined", () => {
    expect(getGroupColorClass(undefined)).toBe("gd-grey");
  });

  it("returns gd-{color} for a color value", () => {
    expect(getGroupColorClass("blue")).toBe("gd-blue");
    expect(getGroupColorClass("red")).toBe("gd-red");
  });
});
