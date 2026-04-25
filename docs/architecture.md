# Architecture

## Overview

```
┌─────────────────────────────────────────────────────┐
│                   Chrome Browser                     │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  Background SW    │  │  New Tab Page (newtab/)   │ │
│  │  - onInstalled    │  │  ┌────────────────────┐  │ │
│  │  - default prefs  │  │  │     React App       │  │ │
│  │                   │  │  │  ┌──────┐ ┌──────┐  │  │ │
│  │                   │  │  │  │Sidebar│ │Views │  │  │ │
│  │                   │  │  │  └──────┘ └──────┘  │  │ │
│  │                   │  │  │  ┌──────────────┐   │  │ │
│  │                   │  │  │  │Zustand Stores│   │  │ │
│  │                   │  │  │  └──────┬───────┘   │  │ │
│  │                   │  │  │         │           │  │ │
│  │                   │  │  │  ┌──────▼───────┐   │  │ │
│  │                   │  │  │  │ Chrome APIs   │   │  │ │
│  │                   │  │  │  └──────────────┘   │  │ │
│  │                   │  │  └────────────────────┘  │ │
│  └──────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Sidebar              # Navigation + logo + badges
├── NTPBar / TopBar      # Context-dependent header
│   ├── NTPBar           # Tabs view: doodle + Google search
│   └── TopBar           # Other views: search bar + actions
├── View (conditional)
│   ├── TabsView         # Tabs + groups + top sites + recently closed
│   ├── BookmarksView    # Folder tree + bookmark list/grid
│   └── (future views)
├── CommandPalette       # ⌘K global search overlay
└── Toast                # Bottom notification bar
```

## Data Flow

```
Chrome Events → Zustand Store → React Components (one-way)
     ↑                                    │
     └────────── User Actions ────────────┘
```

- Chrome API events (onCreated, onRemoved, etc.) update Zustand stores
- React components subscribe to stores via selectors
- User actions dispatch store methods which call Chrome APIs
- Chrome APIs trigger events → stores update → React re-renders

## Store Architecture

Each store is independent and maps to one Chrome API domain:

| Store | Chrome API | Init Strategy |
|-------|-----------|---------------|
| preferenceStore | chrome.storage.local | Eager (first) |
| tabStore | chrome.tabs | Eager (parallel) |
| tabGroupStore | chrome.tabGroups | Eager (parallel) |
| sessionStore | chrome.sessions | Eager (parallel) |
| topSitesStore | chrome.topSites | Eager (parallel) |
| bookmarkStore | chrome.bookmarks | Lazy (on navigate) |

## Theme Strategy

- CSS custom properties defined in `:root` (light) and `[data-theme="dark"]`
- Theme preference stored in preferenceStore
- `system` mode listens to `matchMedia('(prefers-color-scheme: dark)')`
- All components reference `var(--*)` tokens — never hardcode colors
