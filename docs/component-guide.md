# Component Guide

## Phase 1 Component Tree

```
components/
├── icons.tsx           # 22 SVG icons (Icon base + named exports)
├── Favicon.tsx         # MV3 _favicon API + letter-tile fallback
├── TabMarkLogo.tsx     # Sidebar logo + 6 daily-rotating doodles
├── Sidebar.tsx         # Nav items + badges + collapse
├── NTPBar.tsx          # Hero bar with doodle + Google search
├── TopBar.tsx          # Compact search + language toggle
├── Toast.tsx           # Bottom notification + undo + auto-dismiss
├── TopSites.tsx        # Frequent sites row (big/compact/hidden)
├── TabCard.tsx         # Individual tab card with actions
├── TabGroup.tsx        # Group header + tab grid
├── RecentlyClosed.tsx  # Closed tabs list + restore
├── TabsView.tsx        # Tabs view container
├── FolderTree.tsx      # Recursive bookmark folder tree
├── BookmarkRow.tsx     # Bookmark list mode row
├── BookmarkCard.tsx    # Bookmark grid mode card
├── BookmarksView.tsx   # Bookmarks view container
├── CommandPalette.tsx  # ⌘K global search overlay
└── ErrorBoundary.tsx   # Catch-all error boundary
```

## Design Token Reference

All colors use OKLCH color space for perceptual uniformity.

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| --bg | oklch(0.985 0.004 80) | oklch(0.16 0.005 60) | Page background |
| --bg-elev | oklch(1 0 0) | oklch(0.20 0.006 60) | Card/elevated surfaces |
| --bg-sub | oklch(0.965 0.005 80) | oklch(0.18 0.006 60) | Sidebar, secondary |
| --fg | oklch(0.22 0.01 60) | oklch(0.95 0.005 80) | Primary text |
| --fg-2 | oklch(0.42 0.01 60) | oklch(0.78 0.008 70) | Secondary text |
| --accent | oklch(0.68 0.14 60) | oklch(0.78 0.13 70) | Brand accent |
| --border | oklch(0.91 0.005 80) | oklch(0.27 0.008 60) | Default borders |

## Design Source Mapping

| Component | Design File | Lines |
|-----------|------------|-------|
| Sidebar | TabMark.html | L50-99 |
| NTPBar | TabMark.html | L114-181 |
| TopBar | TabMark.html | L184-218 |
| Toast | TabMark.html | L221-235 |
| App | TabMark.html | L237-381 |
| TabCard | views-tabs.jsx | L34-49 |
| TopSites | views-tabs.jsx | L51-90 |
| TabsView | views-tabs.jsx | L113-203 |
| FolderTree | views-bookmarks.jsx | L34-56 |
| BookmarksView | views-bookmarks.jsx | L58-191 |
| CommandPalette | modals.jsx | L3-91 |
| Icons | icons.jsx | Full file |
| Favicon | favicons.jsx | Full file |
| Logo/Doodle | tabmark-logo.jsx | Full file |
