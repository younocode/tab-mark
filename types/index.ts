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

export type ViewId = "tabs" | "bookmarks" | "settings";
