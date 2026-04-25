export interface Translations {
  appName: string;
  appTagline: string;
  nav: {
    tabs: string;
    bookmarks: string;
    readLater: string;
    health: string;
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
    grpReadLater: string;
    grpHistory: string;
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
    snapshot: string;
    closeDuplicates: string;
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
    defaultView: string;
    topSites: string;
    topSitesCount: string;
    groupingRules: string;
    addRule: string;
    data: string;
    exportTags: string;
    clearTags: string;
  };
  readlater: {
    unread: string;
    read: string;
    markRead: string;
    saveBookmark: string;
    remove: string;
    empty: string;
  };
  health: {
    title: string;
    subtitle: string;
    start: string;
    scanning: string;
    checked: (a: number, b: number) => string;
    dead: string;
    duplicates: string;
    noDead: string;
    noDuplicates: string;
    deleteAll: string;
    remove: string;
  };
  snapshots: {
    title: string;
    subtitle: string;
    placeholder: string;
    save: string;
    restore: string;
    rename: string;
    delete: string;
    count: (n: number) => string;
    empty: string;
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
      readLater: "Read Later",
      health: "Health Check",
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
      grpReadLater: "Reading list",
      grpHistory: "Recently visited",
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
      snapshot: "Snapshot",
      closeDuplicates: "Close duplicates",
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
      defaultView: "Default view",
      topSites: "Top sites",
      topSitesCount: "Sites count",
      groupingRules: "Grouping rules",
      addRule: "Add rule",
      data: "Data",
      exportTags: "Export tag data",
      clearTags: "Clear tag data",
    },
    readlater: {
      unread: "Unread",
      read: "Read",
      markRead: "Mark read",
      saveBookmark: "Save as bookmark",
      remove: "Remove",
      empty: "Nothing here. Save articles to read later from the tab card menu.",
    },
    health: {
      title: "Bookmark health",
      subtitle: "Find dead links and duplicates",
      start: "Start scan",
      scanning: "Scanning…",
      checked: (a, b) => `${a} of ${b} checked`,
      dead: "Dead links",
      duplicates: "Duplicates",
      noDead: "No dead links found.",
      noDuplicates: "No duplicates found.",
      deleteAll: "Delete all",
      remove: "Remove",
    },
    snapshots: {
      title: "Snapshots",
      subtitle: "Save and restore tab sessions",
      placeholder: "Snapshot name…",
      save: "Save",
      restore: "Restore",
      rename: "Rename",
      delete: "Delete",
      count: (n) => `${n} tab${n === 1 ? "" : "s"}`,
      empty: "No snapshots yet.",
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
      readLater: "稍后读",
      health: "健康检查",
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
      grpReadLater: "稍后读",
      grpHistory: "最近浏览",
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
      snapshot: "快照",
      closeDuplicates: "关闭重复",
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
      defaultView: "默认视图",
      topSites: "常用网站",
      topSitesCount: "显示数量",
      groupingRules: "分组规则",
      addRule: "添加规则",
      data: "数据",
      exportTags: "导出标签数据",
      clearTags: "清除标签数据",
    },
    readlater: {
      unread: "未读",
      read: "已读",
      markRead: "标记已读",
      saveBookmark: "转为书签",
      remove: "移除",
      empty: "还没有内容。从标签页菜单中保存文章稍后阅读。",
    },
    health: {
      title: "书签健康",
      subtitle: "查找死链与重复书签",
      start: "开始扫描",
      scanning: "扫描中…",
      checked: (a, b) => `已检查 ${a} / ${b}`,
      dead: "死链",
      duplicates: "重复",
      noDead: "未发现死链。",
      noDuplicates: "未发现重复。",
      deleteAll: "全部删除",
      remove: "删除",
    },
    snapshots: {
      title: "快照",
      subtitle: "保存与恢复标签页会话",
      placeholder: "快照名称…",
      save: "保存",
      restore: "恢复",
      rename: "重命名",
      delete: "删除",
      count: (n) => `${n} 个标签`,
      empty: "还没有快照。",
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
