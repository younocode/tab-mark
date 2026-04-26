import type { Tab, TabGroup } from "../types";

export interface DisplayGroup {
  name: string;
  color?: string;
  tabs: Tab[];
}

export function buildGroups(
  tabs: Tab[],
  groups: TabGroup[],
  mode: "chrome" | "domain",
): DisplayGroup[] {
  if (mode === "domain") {
    return buildDomainGroups(tabs);
  }
  return buildChromeGroups(tabs, groups);
}

function buildChromeGroups(tabs: Tab[], groups: TabGroup[]): DisplayGroup[] {
  const groupMap = new Map(groups.map((g) => [g.id, g]));
  const buckets = new Map<string, { group?: TabGroup; tabs: Tab[] }>();

  for (const tab of tabs) {
    const chromeGroup =
      tab.groupId !== -1 ? groupMap.get(tab.groupId) : undefined;
    const key = chromeGroup ? `group-${chromeGroup.id}` : "ungrouped";

    if (!buckets.has(key)) {
      buckets.set(key, { group: chromeGroup, tabs: [] });
    }
    buckets.get(key)!.tabs.push(tab);
  }

  const result: DisplayGroup[] = [];
  for (const [, bucket] of buckets) {
    result.push({
      name: bucket.group?.title || "Other",
      color: bucket.group?.color,
      tabs: bucket.tabs,
    });
  }

  return result;
}

function buildDomainGroups(tabs: Tab[]): DisplayGroup[] {
  const buckets = new Map<string, Tab[]>();

  for (const tab of tabs) {
    let domain: string;
    try {
      domain = new URL(tab.url).hostname;
    } catch {
      domain = "other";
    }

    if (!buckets.has(domain)) {
      buckets.set(domain, []);
    }
    buckets.get(domain)!.push(tab);
  }

  return Array.from(buckets.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([domain, tabs]) => ({
      name: domain,
      tabs,
    }));
}

export function getDomainHue(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = (h * 31 + domain.charCodeAt(i)) % 360;
  }
  return h;
}

export function getGroupColorClass(color?: string): string {
  if (!color) return "gd-grey";
  return `gd-${color}`;
}
