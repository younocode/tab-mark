export interface Translations {
  appName: string;
  appTagline: string;
  nav: {
    tabs: string;
    bookmarks: string;
    settings: string;
  };
  search: {
    placeholderTabs: string;
    placeholderBookmarks: string;
    placeholderAll: string;
    hint: string;
    allHint: string;
    noResults: string;
    grpOpen: string;
    grpBookmarks: string;
  };
  tabs: {
    topSites: string;
    groupCount: (n: number) => string;
    hibernated: string;
    hibernate: string;
    saveAll: string;
    closeAll: string;
    recentlyClosed: string;
    restore: string;
    showMore: string;
    showLess: string;
    duplicate: string;
  };
  bookmarks: {
    all: string;
    folders: string;
    count: (n: number) => string;
    list: string;
    grid: string;
    selected: (n: number) => string;
    addTag: string;
    remove: string;
    move: string;
    added: string;
    path: string;
  };
  settings: {
    appearance: string;
    theme: string;
    themeSystem: string;
    themeLight: string;
    themeDark: string;
    language: string;
  };
  common: {
    close: string;
    open: string;
    min: string;
    just: string;
    hour: string;
    day: string;
    andMore: (n: number) => string;
  };
  empty: {
    tabs: string;
    bookmarks: string;
  };
}

const STRINGS: Record<string, Translations> = {
  en: {
    appName: "TabMark",
    appTagline: "All your tabs, in one place",
    nav: {
      tabs: "Tabs",
      bookmarks: "Bookmarks",
      settings: "Settings",
    },
    search: {
      placeholderTabs: "Search tabs…",
      placeholderBookmarks: "Search bookmarks, tags, paths…",
      placeholderAll: "Search everywhere",
      hint: "⌘K",
      allHint: "@all to search everywhere",
      noResults: "No results",
      grpOpen: "Open tabs",
      grpBookmarks: "Bookmarks",
    },
    tabs: {
      topSites: "Frequent",
      groupCount: (n) => `${n} tab${n === 1 ? "" : "s"}`,
      hibernated: "Hibernated",
      hibernate: "Hibernate",
      saveAll: "Save all",
      closeAll: "Close all",
      recentlyClosed: "Recently closed",
      restore: "Restore",
      showMore: "Show more",
      showLess: "Show less",
      duplicate: "Duplicate",
    },
    bookmarks: {
      all: "All bookmarks",
      folders: "Folders",
      count: (n) => `${n} bookmark${n === 1 ? "" : "s"}`,
      list: "List",
      grid: "Grid",
      selected: (n) => `${n} selected`,
      addTag: "Add tag",
      remove: "Remove",
      move: "Move",
      added: "added",
      path: "in",
    },
    settings: {
      appearance: "Appearance",
      theme: "Theme",
      themeSystem: "System",
      themeLight: "Light",
      themeDark: "Dark",
      language: "Language",
    },
    common: {
      close: "Close",
      open: "Open",
      min: "min ago",
      just: "just now",
      hour: "h ago",
      day: "d ago",
      andMore: (n) => `+${n} more`,
    },
    empty: {
      tabs: "Only one tab open. Enjoy the focus.",
      bookmarks: "No bookmarks in this folder yet.",
    },
  },
  zh: {
    appName: "TabMark",
    appTagline: "所有标签页，一处掌控",
    nav: {
      tabs: "标签页",
      bookmarks: "书签",
      settings: "设置",
    },
    search: {
      placeholderTabs: "搜索标签页…",
      placeholderBookmarks: "搜索书签、标签、路径…",
      placeholderAll: "全局搜索",
      hint: "⌘K",
      allHint: "输入 @all 跨视图搜索",
      noResults: "无结果",
      grpOpen: "已打开",
      grpBookmarks: "已收藏",
    },
    tabs: {
      topSites: "常用",
      groupCount: (n) => `${n} 个标签`,
      hibernated: "已休眠",
      hibernate: "休眠",
      saveAll: "全部收藏",
      closeAll: "全部关闭",
      recentlyClosed: "最近关闭",
      restore: "恢复",
      showMore: "展开更多",
      showLess: "收起",
      duplicate: "重复",
    },
    bookmarks: {
      all: "全部书签",
      folders: "文件夹",
      count: (n) => `${n} 个书签`,
      list: "列表",
      grid: "卡片",
      selected: (n) => `已选 ${n} 项`,
      addTag: "添加标签",
      remove: "删除",
      move: "移动",
      added: "添加于",
      path: "位于",
    },
    settings: {
      appearance: "外观",
      theme: "主题",
      themeSystem: "跟随系统",
      themeLight: "浅色",
      themeDark: "深色",
      language: "语言",
    },
    common: {
      close: "关闭",
      open: "打开",
      min: "分钟前",
      just: "刚刚",
      hour: "小时前",
      day: "天前",
      andMore: (n) => `+${n} 个`,
    },
    empty: {
      tabs: "只剩一个标签页。专注吧。",
      bookmarks: "此文件夹下还没有书签。",
    },
  },
};

export function getTranslations(lang: string): Translations {
  return STRINGS[lang] || STRINGS.en;
}
