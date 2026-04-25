# Data Flow

## Store Interfaces

### preferenceStore
```typescript
interface PreferenceState {
  theme: "system" | "light" | "dark";
  lang: "en" | "zh";
  topSitesStyle: "big" | "small" | "compact" | "hidden";
  tabsLayout: "grid" | "list";
  density: "compact" | "comfortable" | "spacious";
  grouping: "chrome" | "domain";
  groupHeader: "row" | "card" | "pill";
}
```
- Source: `chrome.storage.local`
- Events: `chrome.storage.onChanged`

### tabStore
```typescript
interface TabState {
  tabs: Tab[];
  activeTabId: number | null;
}
```
- Source: `chrome.tabs.query({})`
- Events: `onCreated`, `onRemoved`, `onUpdated`, `onMoved`, `onActivated`

### tabGroupStore
```typescript
interface TabGroupState {
  groups: TabGroup[];
}
```
- Source: `chrome.tabGroups.query({})`
- Events: `onCreated`, `onRemoved`, `onUpdated`

### sessionStore
```typescript
interface SessionState {
  recentlyClosed: RecentlyClosed[];
}
```
- Source: `chrome.sessions.getRecentlyClosed()`
- Events: None — refresh on tab close

### topSitesStore
```typescript
interface TopSitesState {
  sites: TopSite[];
}
```
- Source: `chrome.topSites.get()`
- Events: None — fetch on page load

### bookmarkStore
```typescript
interface BookmarkState {
  tree: BookmarkNode[];
  initialized: boolean;
}
```
- Source: `chrome.bookmarks.getTree()`
- Events: `onCreated`, `onRemoved`, `onChanged`, `onMoved`
- **Lazy loaded** — only initializes when Bookmarks view is first opened

## Initialization Sequence

```
App mount
  │
  ├── preferenceStore.init()    ← first (controls theme/lang)
  │
  └── Promise.all([
        tabStore.init(),
        tabGroupStore.init(),
        sessionStore.init(),
        topSitesStore.init(),
      ])
  │
  └── (bookmarkStore.init() deferred until view === "bookmarks")
```

Target: first paint < 200ms

## Search Architecture

### Phase 1: In-view substring matching
- Each view filters its own data locally
- Case-insensitive substring match on title, URL, domain
- Debounced 150ms

### Global search (@all → CommandPalette)
- Typing `@all` in the view search triggers CommandPalette
- CommandPalette queries all stores in parallel
- Results grouped by source: tabs → bookmarks → reading list → history
