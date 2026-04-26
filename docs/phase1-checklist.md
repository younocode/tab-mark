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

## Foundation
- [ ] Design tokens in global.css (OKLCH light/dark)
- [ ] TypeScript type definitions
- [ ] Icon components
- [ ] Favicon component (MV3 + letter fallback)
- [ ] TabMarkLogo + daily doodles
- [ ] i18n translation system

## Zustand Stores
- [ ] preferenceStore
- [ ] tabStore
- [ ] tabGroupStore
- [ ] sessionStore
- [ ] topSitesStore
- [ ] bookmarkStore (lazy)
- [ ] readingListStore (where supported)

## App Shell
- [ ] HeaderBar
- [ ] NTPBar
- [ ] Toast
- [ ] App shell with `home | bookmarks` view routing
- [ ] PanelModal

## Home Workspace
- [ ] HomeView container
- [ ] TopSites
- [ ] ReadingListSection
- [ ] TabCard
- [ ] TabGroup with GroupHeader
- [ ] RecentlyClosed
- [ ] Duplicate tab action
- [ ] grouping.ts utility

## Bookmarks View
- [ ] FolderTree
- [ ] BookmarkRow
- [ ] BookmarkCard
- [ ] BookmarksView container
- [ ] bookmarks.ts utility
- [ ] search.ts utility

## Overlays And Panels
- [ ] CommandPalette overlay
- [ ] HealthView inside PanelModal
- [ ] SettingsView inside PanelModal
- [ ] useKeyboardNav hook
- [ ] useDebouncedValue hook
- [ ] Keyboard shortcuts (Cmd+K, Escape)

## Theme System
- [ ] useTheme hook
- [ ] System/light/dark detection
- [ ] Theme toggle in Settings Panel

## Background Worker
- [ ] onInstalled default preferences
- [ ] Message routing infrastructure

## Integration
- [ ] Error boundaries
- [ ] Performance optimizations (React.memo, selectors)
- [ ] End-to-end testing
