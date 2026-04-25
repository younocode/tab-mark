export interface Tab {
  id: number;
  windowId: number;
  groupId: number;
  url: string;
  title: string;
  favIconUrl?: string;
  active: boolean;
  pinned: boolean;
  discarded: boolean;
  index: number;
}

export interface TabGroup {
  id: number;
  title: string;
  color: chrome.tabGroups.Color;
  collapsed: boolean;
  windowId: number;
}

export interface TopSite {
  url: string;
  title: string;
}

export interface RecentlyClosed {
  tab?: {
    tabId: number;
    windowId: number;
    url: string;
    title: string;
    favIconUrl?: string;
  };
  window?: {
    windowId: number;
    tabs: Array<{
      url: string;
      title: string;
      favIconUrl?: string;
    }>;
  };
  lastModified: number;
  sessionId?: string;
}

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  parentId?: string;
  dateAdded?: number;
  children?: BookmarkNode[];
}

export interface UserPreferences {
  theme: "system" | "light" | "dark";
  lang: "en" | "zh";
  defaultView: "tabs" | "bookmarks";
  topSitesStyle: "big" | "small" | "compact" | "hidden";
  topSitesCount: number;
  tabsLayout: "grid" | "list";
  density: "compact" | "comfortable" | "spacious";
  grouping: "chrome" | "domain";
  groupHeader: "row" | "card" | "pill";
}

export type ViewId = "tabs" | "bookmarks" | "readlater" | "health" | "settings";

export interface ReadingListEntry {
  url: string;
  title: string;
  hasBeenRead: boolean;
  lastUpdateTime: number;
  creationTime: number;
}

export interface GroupingRule {
  id: string;
  name: string;
  patterns: string[];
}

export interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  tabs: { url: string; title: string; groupName?: string }[];
}

export interface HealthResult {
  bookmarkId: string;
  url: string;
  title: string;
  status: number | "timeout" | "error";
  parentPath: string;
}

export interface DuplicateGroup {
  url: string;
  title: string;
  bookmarkIds: string[];
  paths: string[];
  folderPaths: string[];
}
