# Architecture

## Overview

```
┌─────────────────────────────────────────────────────┐
│                   Chrome Browser                     │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  Background SW    │  │  New Tab Page (newtab/)   │ │
│  │  - onInstalled    │  │  ┌────────────────────┐  │ │
│  │  - message route  │  │  │     React App       │  │ │
│  │                   │  │  │  HeaderBar          │  │ │
│  │                   │  │  │  Home/Bookmarks     │  │ │
│  │                   │  │  │  PanelModal         │  │ │
│  │                   │  │  │  CommandPalette     │  │ │
│  │                   │  │  └────────┬───────────┘  │ │
│  │                   │  │  ┌────────▼───────────┐  │ │
│  │                   │  │  │  Zustand Stores     │  │ │
│  │                   │  │  └────────┬───────────┘  │ │
│  │                   │  │  ┌────────▼───────────┐  │ │
│  │                   │  │  │   Chrome APIs       │  │ │
│  │                   │  │  └────────────────────┘  │ │
│  └──────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── HeaderBar             # Brand, Home/Bookmarks switch, global search trigger
├── NTPBar                # Compact Home hero with doodle/wordmark
├── View (conditional)
│   ├── HomeView          # Home workspace: reading, tabs, groups, closed tabs
│   └── BookmarksView     # Bookmark folder/tag filtering + list/grid
├── CommandPalette        # Cmd+K overlay for search and actions
├── PanelModal            # Lightweight modal shell
│   ├── HealthView        # Bookmark health content
│   └── SettingsView      # Preferences content
└── Toast                 # Bottom notification bar
```

## Product Model

- Route-level views are `home | bookmarks`.
- `health` and `settings` are panel actions opened through `PanelModal`.
- `CommandPalette` is an overlay, not a page.
- Home is the default new-tab workspace; Bookmarks is the secondary organization view.

## Data Flow

```
Chrome Events → Zustand Store → React Components (one-way)
     ↑                                    │
     └────────── User Actions ────────────┘
```

- Chrome API events update Zustand stores.
- React components subscribe to stores via selectors.
- User actions dispatch store methods which call Chrome APIs.
- Chrome APIs trigger events, stores update, and React re-renders.

## Store Architecture

Each store is independent and maps to one Chrome API domain:

| Store | Chrome API | Init Strategy |
|-------|-----------|---------------|
| preferenceStore | chrome.storage.local | Eager (first) |
| tabStore | chrome.tabs | Eager (parallel) |
| tabGroupStore | chrome.tabGroups | Eager (parallel) |
| sessionStore | chrome.sessions | Eager (parallel) |
| topSitesStore | chrome.topSites | Eager (parallel) |
| readingListStore | chrome.readingList | Eager where supported |
| bookmarkStore | chrome.bookmarks | Lazy (Bookmarks view or Health panel) |

## Theme Strategy

- CSS custom properties defined in `:root` (light) and `[data-theme="dark"]`.
- Theme preference is stored in preferenceStore.
- `system` mode listens to `matchMedia('(prefers-color-scheme: dark)')`.
- Components reference `var(--*)` tokens for colors.
