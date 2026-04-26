export interface Translations {
  appName: string;
  appTagline: string;
  nav: {
    tabs: string;
    bookmarks: string;
    readLater: string;
    health: string;
    settings: string;
    home: string;
  };
  cmdActions: {
    health: string;
    healthDesc: string;
    deadLinks: string;
    deadLinksDesc: string;
    duplicateBookmarks: string;
    duplicateBookmarksDesc: string;
    settings: string;
    settingsDesc: string;
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
    grpWeb: string;
    webSearch: string;
    clear: string;
  };
  tabs: {
    topSites: string;
    groups: string;
    recentTabs: string;
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
    closeDuplicates: string;
    collapseGroup: string;
    expandGroup: string;
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
    moveFailed: string;
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
    groupNamePlaceholder: string;
    domainPatternsPlaceholder: string;
    clearTagsConfirmTitle: string;
    clearTagsConfirmMessage: string;
  };
  ntp: {
    tagline: string;
    googlePlaceholder: string;
  };
  readlater: {
    unread: string;
    read: string;
    markRead: string;
    saveBookmark: string;
    removeBookmark: string;
    remove: string;
    empty: string;
  };
  health: {
    title: string;
    subtitle: string;
    deadTitle: string;
    deadSubtitle: string;
    duplicatesTitle: string;
    duplicatesSubtitle: string;
    start: string;
    startDead: string;
    startDuplicates: string;
    scanning: string;
    checked: (a: number, b: number) => string;
    dead: string;
    duplicates: string;
    noDead: string;
    noDuplicates: string;
    deleteAll: string;
    remove: string;
    deleteAllTitle: (n: number) => string;
    deleteAllMessage: string;
    pause: string;
    resume: string;
    cancel: string;
    warn: string;
    confirmed: string;
    statusLabels: Record<string, string>;
    emptyFolderCount: (n: number) => string;
  };
  contextMenu: {
    openNewTab: string;
    openNewWindow: string;
    openIncognito: string;
    edit: string;
    delete: string;
    copyUrl: string;
    openAll: string;
    rename: string;
    newFolder: string;
    deleteFolder: string;
  };
  editDialog: {
    editTitle: string;
    name: string;
    url: string;
    save: string;
    cancel: string;
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
      home: "Home",
    },
    cmdActions: {
      health: "Health Check",
      healthDesc: "Scan bookmarks for dead links",
      deadLinks: "Check dead links",
      deadLinksDesc: "Scan bookmarks for broken or suspicious URLs",
      duplicateBookmarks: "Check duplicate bookmarks",
      duplicateBookmarksDesc: "Find repeated bookmark URLs",
      settings: "Settings",
      settingsDesc: "Theme, layout, preferences",
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
      grpWeb: "Web",
      webSearch: "Search web for",
      clear: "Clear",
    },
    tabs: {
      topSites: "Frequent",
      groups: "Groups",
      recentTabs: "Recent tabs",
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
      closeDuplicates: "Close duplicates",
      collapseGroup: "Collapse group",
      expandGroup: "Expand group",
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
      moveFailed: "Move failed",
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
      groupNamePlaceholder: "Group name",
      domainPatternsPlaceholder: "Domains (comma-sep)",
      clearTagsConfirmTitle: "Clear all tag data?",
      clearTagsConfirmMessage: "This will permanently remove all custom tags you have added to bookmarks. Bookmarks themselves will not be affected.",
    },
    ntp: {
      tagline: "Tabs · Bookmarks · One home",
      googlePlaceholder: "Search tabs, bookmarks, actions, or the web",
    },
    readlater: {
      unread: "Unread",
      read: "Read",
      markRead: "Mark read",
      saveBookmark: "Save as bookmark",
      removeBookmark: "Remove from bookmarks",
      remove: "Remove",
      empty: "Nothing here. Save articles to read later from the tab card menu.",
    },
    health: {
      title: "Bookmark health",
      subtitle: "Find dead links and duplicates",
      deadTitle: "Dead link check",
      deadSubtitle: "Scan bookmarks for broken, unreachable, or suspicious URLs.",
      duplicatesTitle: "Duplicate bookmark check",
      duplicatesSubtitle: "Find repeated bookmark URLs and remove duplicate entries.",
      start: "Start scan",
      startDead: "Check dead links",
      startDuplicates: "Check duplicates",
      scanning: "Scanning…",
      checked: (a, b) => `${a} of ${b} checked`,
      dead: "Dead links",
      duplicates: "Duplicates",
      noDead: "No dead links found.",
      noDuplicates: "No duplicates found.",
      deleteAll: "Delete all",
      remove: "Remove",
      deleteAllTitle: (n) => `Delete ${n} dead links?`,
      deleteAllMessage: "These bookmarks point to pages that no longer exist. They will be permanently removed.",
      pause: "Pause",
      resume: "Resume",
      cancel: "Cancel",
      warn: "Suspicious",
      confirmed: "Confirmed",
      statusLabels: {
        dead: "Not found",
        soft404: "Soft 404",
        timeout: "Timeout",
        dns_error: "DNS error",
        ssl_error: "SSL error",
        server_error: "Server error",
        rate_limited: "Rate limited",
        forbidden: "Forbidden",
        redirected: "Redirected",
        invalid: "Invalid URL",
        unknown: "Unknown",
      },
      emptyFolderCount: (n) => `${n} empty`,
    },
    contextMenu: {
      openNewTab: "Open in new tab",
      openNewWindow: "Open in new window",
      openIncognito: "Open in incognito window",
      edit: "Edit",
      delete: "Delete",
      copyUrl: "Copy URL",
      openAll: "Open all bookmarks",
      rename: "Rename",
      newFolder: "New folder",
      deleteFolder: "Delete folder",
    },
    editDialog: {
      editTitle: "Edit bookmark",
      name: "Name",
      url: "URL",
      save: "Save",
      cancel: "Cancel",
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
      home: "首页",
    },
    cmdActions: {
      health: "健康检查",
      healthDesc: "扫描书签中的死链",
      deadLinks: "检查死链",
      deadLinksDesc: "扫描书签中的失效或可疑链接",
      duplicateBookmarks: "检查重复书签",
      duplicateBookmarksDesc: "查找重复收藏的书签链接",
      settings: "设置",
      settingsDesc: "主题、布局、偏好",
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
      grpWeb: "网页",
      webSearch: "网页搜索",
      clear: "清除",
    },
    tabs: {
      topSites: "常用",
      groups: "分组",
      recentTabs: "最近标签",
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
      closeDuplicates: "关闭重复",
      collapseGroup: "折叠分组",
      expandGroup: "展开分组",
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
      moveFailed: "移动失败",
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
      groupNamePlaceholder: "分组名称",
      domainPatternsPlaceholder: "域名（逗号分隔）",
      clearTagsConfirmTitle: "清除所有标签数据？",
      clearTagsConfirmMessage: "此操作将永久删除您为书签添加的所有自定义标签。书签本身不会受到影响。",
    },
    ntp: {
      tagline: "标签 · 书签 · 同一主页",
      googlePlaceholder: "搜索标签、书签、动作或网页",
    },
    readlater: {
      unread: "未读",
      read: "已读",
      markRead: "标记已读",
      saveBookmark: "转为书签",
      removeBookmark: "从书签中移除",
      remove: "移除",
      empty: "还没有内容。从标签页菜单中保存文章稍后阅读。",
    },
    health: {
      title: "书签健康",
      subtitle: "查找死链与重复书签",
      deadTitle: "检查死链",
      deadSubtitle: "扫描书签中的失效、无法访问或可疑链接。",
      duplicatesTitle: "检查重复书签",
      duplicatesSubtitle: "查找重复收藏的书签链接，并删除多余条目。",
      start: "开始扫描",
      startDead: "检查死链",
      startDuplicates: "检查重复书签",
      scanning: "扫描中…",
      checked: (a, b) => `已检查 ${a} / ${b}`,
      dead: "死链",
      duplicates: "重复",
      noDead: "未发现死链。",
      noDuplicates: "未发现重复。",
      deleteAll: "全部删除",
      remove: "删除",
      deleteAllTitle: (n) => `删除 ${n} 条死链？`,
      deleteAllMessage: "这些书签指向已不存在的页面，将被永久删除。",
      pause: "暂停",
      resume: "继续",
      cancel: "取消",
      warn: "可疑",
      confirmed: "确认",
      statusLabels: {
        dead: "已失效",
        soft404: "疑似失效",
        timeout: "访问超时",
        dns_error: "域名异常",
        ssl_error: "证书异常",
        server_error: "服务异常",
        rate_limited: "请求受限",
        forbidden: "无权限访问",
        redirected: "已跳转",
        invalid: "无效链接",
        unknown: "未知",
      },
      emptyFolderCount: (n) => `${n} 个空文件夹`,
    },
    contextMenu: {
      openNewTab: "在新标签页中打开",
      openNewWindow: "在新窗口中打开",
      openIncognito: "在无痕窗口中打开",
      edit: "编辑",
      delete: "删除",
      copyUrl: "复制链接",
      openAll: "打开所有书签",
      rename: "重命名",
      newFolder: "新建文件夹",
      deleteFolder: "删除文件夹",
    },
    editDialog: {
      editTitle: "编辑书签",
      name: "名称",
      url: "链接",
      save: "保存",
      cancel: "取消",
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
