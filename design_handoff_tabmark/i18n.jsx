// i18n.jsx — bilingual strings

const STRINGS = {
  en: {
    appName: "TabMark",
    appTagline: "All your tabs, in one place",
    nav: { tabs: "Tabs", bookmarks: "Bookmarks", readLater: "Read Later", health: "Health Check", settings: "Settings" },
    search: { placeholderTabs: "Search tabs…", placeholderBookmarks: "Search bookmarks, tags, paths…", placeholderRL: "Search reading list…", placeholderAll: "Search everywhere", hint: "⌘K", allHint: "@all to search everywhere", noResults: "No results", grpOpen: "Open tabs", grpBookmarks: "Bookmarks", grpRead: "Reading list", grpHistory: "Recently visited" },
    tabs: { topSites: "Frequent", groupCount: (n) => `${n} tab${n === 1 ? "" : "s"}`, hibernated: "Hibernated", hibernate: "Hibernate", saveAll: "Save all", closeAll: "Close all", recentlyClosed: "Recently closed", restore: "Restore", showMore: "Show more", showLess: "Show less", duplicate: "Duplicate", snapshot: "Snapshot", new: "New snapshot", saveSnapshot: "Save current state" },
    bookmarks: { all: "All bookmarks", folders: "Folders", tags: "Tags", count: (n) => `${n} bookmark${n === 1 ? "" : "s"}`, list: "List", grid: "Grid", selected: (n) => `${n} selected`, addTag: "Add tag", remove: "Remove", move: "Move", added: "added", path: "in" },
    readlater: { unread: "Unread", read: "Read", markRead: "Mark read", markUnread: "Mark unread", saveBookmark: "Save as bookmark", remove: "Remove", empty: "Nothing here. Save articles to read later from the tab card menu." },
    health: { title: "Bookmark health", subtitle: "Find dead links and duplicates", start: "Start scan", scanning: "Scanning…", checked: (a, b) => `${a} of ${b} checked`, dead: "Dead links", duplicates: "Duplicates", noDead: "No dead links found.", deleteAll: "Delete all", keep: "Keep this", remove: "Remove", group: (n) => `${n} duplicates` },
    settings: { appearance: "Appearance", theme: "Theme", themeSystem: "System", themeLight: "Light", themeDark: "Dark", language: "Language", defaultView: "Default view", topSites: "Top sites", showTopSites: "Show top sites row", topSitesCount: "Number of sites", hibernation: "Hibernation", hibEnabled: "Auto-hibernate inactive tabs", hibIdle: "Idle threshold (minutes)", grouping: "Grouping rules", addRule: "Add rule", data: "Data", exportTags: "Export tag data", clearTags: "Clear tag data" },
    smartSave: { title: "Save bookmark", folder: "Folder", suggested: "Suggested", tags: "Tags", addTag: "Add tag…", readLater: "Add to reading list instead", cancel: "Cancel", save: "Save" },
    snapshots: { title: "Snapshots", subtitle: "Save and restore tab sessions", saveCurrent: "Save current state", placeholder: "Snapshot name…", save: "Save", restore: "Restore", rename: "Rename", delete: "Delete", count: (n) => `${n} tabs`, empty: "No snapshots yet." },
    common: { close: "Close", open: "Open", min: "min ago", just: "just now", hour: "h ago", day: "d ago", andMore: (n) => `+${n} more` },
    empty: { tabs: "Only one tab open. Enjoy the focus.", bookmarks: "No bookmarks in this folder yet." },
  },
  zh: {
    appName: "TabMark",
    appTagline: "所有标签页，一处掌控",
    nav: { tabs: "标签页", bookmarks: "书签", readLater: "稍后读", health: "健康检查", settings: "设置" },
    search: { placeholderTabs: "搜索标签页…", placeholderBookmarks: "搜索书签、标签、路径…", placeholderRL: "搜索阅读列表…", placeholderAll: "全局搜索", hint: "⌘K", allHint: "输入 @all 跨视图搜索", noResults: "无结果", grpOpen: "已打开", grpBookmarks: "已收藏", grpRead: "稍后读", grpHistory: "最近浏览" },
    tabs: { topSites: "常用", groupCount: (n) => `${n} 个标签`, hibernated: "已休眠", hibernate: "休眠", saveAll: "全部收藏", closeAll: "全部关闭", recentlyClosed: "最近关闭", restore: "恢复", showMore: "展开更多", showLess: "收起", duplicate: "重复", snapshot: "快照", new: "新建快照", saveSnapshot: "保存当前状态" },
    bookmarks: { all: "全部书签", folders: "文件夹", tags: "标签", count: (n) => `${n} 个书签`, list: "列表", grid: "卡片", selected: (n) => `已选 ${n} 项`, addTag: "添加标签", remove: "删除", move: "移动", added: "添加于", path: "位于" },
    readlater: { unread: "未读", read: "已读", markRead: "标记已读", markUnread: "标记未读", saveBookmark: "转为书签", remove: "移除", empty: "还没有内容。从标签页菜单中保存文章稍后阅读。" },
    health: { title: "书签健康", subtitle: "查找死链与重复书签", start: "开始扫描", scanning: "扫描中…", checked: (a, b) => `已检查 ${a} / ${b}`, dead: "死链", duplicates: "重复", noDead: "未发现死链。", deleteAll: "全部删除", keep: "保留此项", remove: "删除", group: (n) => `${n} 个重复` },
    settings: { appearance: "外观", theme: "主题", themeSystem: "跟随系统", themeLight: "浅色", themeDark: "深色", language: "语言", defaultView: "默认视图", topSites: "常用网站", showTopSites: "显示常用网站", topSitesCount: "显示数量", hibernation: "休眠", hibEnabled: "自动休眠不活跃标签页", hibIdle: "空闲阈值（分钟）", grouping: "分组规则", addRule: "添加规则", data: "数据", exportTags: "导出标签数据", clearTags: "清除标签数据" },
    smartSave: { title: "保存书签", folder: "文件夹", suggested: "推荐", tags: "标签", addTag: "添加标签…", readLater: "改为加入稍后读", cancel: "取消", save: "保存" },
    snapshots: { title: "快照", subtitle: "保存与恢复标签页会话", saveCurrent: "保存当前状态", placeholder: "快照名称…", save: "保存", restore: "恢复", rename: "重命名", delete: "删除", count: (n) => `${n} 个标签`, empty: "还没有快照。" },
    common: { close: "关闭", open: "打开", min: "分钟前", just: "刚刚", hour: "小时前", day: "天前", andMore: (n) => `+${n} 个` },
    empty: { tabs: "只剩一个标签页。专注吧。", bookmarks: "此文件夹下还没有书签。" },
  },
};

function useT(lang) {
  return STRINGS[lang] || STRINGS.en;
}

Object.assign(window, { STRINGS, useT });
