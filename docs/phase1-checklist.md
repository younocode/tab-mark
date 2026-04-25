# Phase 1 Checklist

## Project Setup
- [x] Git init + .gitignore
- [x] WXT + React + TypeScript scaffold
- [x] Dependencies: Zustand, Tailwind v4, @types/chrome
- [x] WXT config: manifest permissions, Tailwind plugin
- [x] Directory structure

## Documentation
- [x] CLAUDE.md
- [x] docs/architecture.md
- [x] docs/component-guide.md
- [x] docs/data-flow.md
- [x] docs/development-guide.md
- [x] docs/phase1-checklist.md

## Foundation (Step 3)
- [ ] Design tokens in global.css (OKLCH light/dark)
- [ ] TypeScript type definitions
- [ ] Icon components (22 SVG icons)
- [ ] Favicon component (MV3 + letter fallback)
- [ ] TabMarkLogo + daily doodles
- [ ] i18n translation system

## Zustand Stores (Step 4)
- [ ] preferenceStore
- [ ] tabStore
- [ ] tabGroupStore
- [ ] sessionStore
- [ ] topSitesStore
- [ ] bookmarkStore (lazy)

## Layout (Step 5)
- [ ] Sidebar
- [ ] NTPBar
- [ ] TopBar
- [ ] Toast
- [ ] App shell with view routing

## Tabs View (Step 6)
- [ ] TopSites
- [ ] TabCard
- [ ] TabGroup with GroupHeader
- [ ] RecentlyClosed
- [ ] TabsView container
- [ ] grouping.ts utility
- [ ] favicon.ts utility

## Bookmarks View (Step 7)
- [ ] FolderTree
- [ ] BookmarkRow
- [ ] BookmarkCard
- [ ] BookmarksView container
- [ ] bookmarks.ts utility
- [ ] search.ts utility

## CommandPalette (Step 8)
- [ ] CommandPalette overlay
- [ ] useKeyboardNav hook
- [ ] useDebouncedValue hook
- [ ] Keyboard shortcuts (⌘K, Escape)

## Theme System (Step 9)
- [ ] useTheme hook
- [ ] System/light/dark detection
- [ ] Theme toggle in UI

## Background Worker (Step 10)
- [ ] onInstalled default preferences
- [ ] Message routing infrastructure

## Integration (Step 11)
- [ ] Error boundaries
- [ ] Performance optimizations (React.memo, selectors)
- [ ] End-to-end testing
