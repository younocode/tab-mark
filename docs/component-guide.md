# Component Guide

## Current Component Tree

```
components/
├── icons.tsx           # Icon base + named exports
├── Favicon.tsx         # MV3 _favicon API + letter-tile fallback
├── TabMarkLogo.tsx     # Brand mark + daily-rotating doodles
├── HeaderBar.tsx       # Brand, Home/Bookmarks switch, global search trigger
├── NTPBar.tsx          # Compact Home hero with doodle/wordmark
├── HomeView.tsx        # Home workspace container
├── TopSites.tsx        # Frequent sites module
├── ReadingListSection.tsx
├── TabCard.tsx         # Individual tab card with actions
├── TabGroup.tsx        # Group header + tab grid helpers
├── RecentlyClosed.tsx  # Closed tabs list + restore
├── FolderTree.tsx      # Recursive bookmark folder tree
├── BookmarkRow.tsx     # Bookmark list mode row
├── BookmarkCard.tsx    # Bookmark grid mode card
├── BookmarksView.tsx   # Bookmarks organization view
├── CommandPalette.tsx  # Cmd+K global search/action overlay
├── PanelModal.tsx      # Lightweight modal shell for panels
├── HealthView.tsx      # Health panel content
├── SettingsView.tsx    # Settings panel content
├── Toast.tsx           # Bottom notification + undo + auto-dismiss
└── ErrorBoundary.tsx   # Catch-all error boundary
```

## Responsibilities

- `App` owns the route-level view state: `home | bookmarks`.
- `HeaderBar` is the only persistent navigation surface.
- `HomeView` owns the default new-tab workspace modules: top sites, reading list, grouped open tabs, duplicate actions, and recently closed tabs.
- `BookmarksView` owns bookmark organization: folder filtering, tag filtering, search, list/grid rendering, and batch operations.
- `CommandPalette` handles cross-domain search and action entry points.
- `PanelModal` hosts lightweight panels such as `HealthView` and `SettingsView`.

## Design Token Reference

All colors use OKLCH color space for perceptual uniformity.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --bg | oklch(0.985 0.004 80) | oklch(0.16 0.005 60) | Page background |
| --bg-elev | oklch(1 0 0) | oklch(0.20 0.006 60) | Card/elevated surfaces |
| --bg-sub | oklch(0.965 0.005 80) | oklch(0.18 0.006 60) | Secondary surfaces |
| --fg | oklch(0.22 0.01 60) | oklch(0.95 0.005 80) | Primary text |
| --fg-2 | oklch(0.42 0.01 60) | oklch(0.78 0.008 70) | Secondary text |
| --accent | oklch(0.68 0.14 60) | oklch(0.78 0.13 70) | Brand accent |
| --border | oklch(0.91 0.005 80) | oklch(0.27 0.008 60) | Default borders |

## Product Design Source

`TabMark-PRD.md` is the sole product and design source of truth. Files in `docs/` describe implementation architecture and component responsibilities only.
