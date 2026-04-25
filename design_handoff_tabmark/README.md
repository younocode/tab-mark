# Handoff: TabMark — Chrome Extension New Tab Page

## Overview
TabMark is a Chrome extension that replaces the New Tab page with a unified workspace for managing **open tabs, bookmarks, reading list, browsing history, and link health**. It blends Chrome's native New Tab experience (centered Google search, top sites) with deeper organization tools (smart-grouped tabs, hibernation, bookmark health checks, snapshots, command palette).

The prototype is a fully interactive HTML/React design exploration covering all primary screens, modals, keyboard shortcuts, and tweakable parameters described in the PRD.

## About the Design Files
**The files in this bundle are design references created in HTML — interactive prototypes showing intended look and behavior, NOT production code to copy directly.**

The task is to **recreate these designs as a real Chrome extension** using Manifest V3 (chrome.tabs, chrome.bookmarks, chrome.history, chrome.sessions, chrome.storage APIs) and the framework of your choice (React + Vite is recommended; the prototype uses React 18 + JSX, so the component structure will translate cleanly).

The HTML files use:
- React 18 (UMD) + Babel Standalone for in-browser JSX — replace with a real Vite/Webpack toolchain
- Inline mock data in `data.jsx` — replace with `chrome.tabs.query`, `chrome.bookmarks.getTree`, etc.
- A single-file `<style>` injection — split into CSS modules or use Tailwind/CSS-in-JS

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, iconography, and interaction details are settled. Recreate pixel-perfect.

The visual system is **Linear/Raycast-inspired**: dense layouts, JetBrains Mono for technical metadata, warm amber accent (`#D97757`), thin borders, soft shadows, OKLCH color tokens for theme correctness.

---

## Screens / Views

### 1. Tabs view (default landing screen)
**Purpose:** Show all open tabs grouped by Chrome Tab Groups (or by domain when no groups exist), top sites, and recently closed.

**Layout (top to bottom):**
1. **NTP hero bar** — Chrome New Tab style, sticky, condenses on scroll
   - Expanded: 56px top padding, centered TabMark doodle (92px tall, daily-rotating variant), tagline "Tabs · Bookmarks · One home", 56px Google search box (28px border radius)
   - Condensed (after scrolling 24px+): doodle/tagline collapse to 0, Google search shrinks to 38px (19px radius), 10px padding
2. **Top sites** — grid of frequently-used sites, three layout variants (big card / compact row / hidden) controlled by tweak
3. **Tab groups** — sections with colored header dots, group name, tab count, batch actions (hibernate group / save group as folder / close group). Two grouping modes:
   - **Chrome groups** (default): user-named groups with user-picked colors (Development, Research, Design, Docs, Other)
   - **By domain**: fallback when no Chrome groups — auto-grouped by hostname, monospace headers, auto hue per domain, "auto" tag
4. **Tab cards** — favicon, title, domain, hibernation badge if applicable, hover actions (hibernate / save / close)
5. **Recently closed** — collapsible list, last 10, click to restore

**Components:**
- `TabCard` — 32px row in list mode, ~80×80 in grid mode. Favicon 16px, title 13px/500, domain 11px JetBrains Mono fg-3, hover row reveals action icons
- `GroupHeader` — colored dot 8px, group name (Inter 13/600 in chrome mode, JetBrains Mono 12/500 in domain mode), tab count badge in mono fg-4, action buttons appear on hover
- `TopSiteCard` — 110px+ flex grid, favicon + title; "big" variant adds domain row in mono

### 2. Bookmarks view
**Purpose:** Browse and manage bookmarks with folder tree, tag cloud, search, batch operations.

**Layout:** Two-column inside `.tm-content.bookmarks`
- **Left rail (240px):** folder tree, tag cloud at bottom
- **Right pane:** topbar with view toggle (list/grid), bookmark items, batch action bar appears when items selected

**Components:**
- `FolderTreeItem` — indent per depth, chevron toggle, count badge in mono
- `TagChip` — 6px radius, fg-2 on bg-sub, click to filter, selected = accent-bg + accent-border
- `BookmarkRow` — favicon, title (search-highlighted in accent-bg), URL/path in mono fg-3, dead-link styling (strikethrough + danger color)
- `BatchActionBar` — sticky bottom bar with selected count + bulk move/tag/delete

### 3. Read Later view
Two tabs: Unread / Read. Each item shows title, source domain, added date, time-to-read estimate, mark-as-read toggle.

### 4. Health Check view
**Purpose:** Scan bookmarks for broken links and duplicates.

**Components:**
- Scan progress bar with animated fill (0→100% over 2.5s on trigger)
- Two tabs: "Dead links" / "Duplicates"
- Each row: bookmark info + actions (keep / remove / edit)

### 5. Settings view
Sections: Appearance (theme — read-only, follows system; language EN/中文), Top sites (style), Hibernation (enabled toggle, idle threshold), Grouping (mode), Data (export JSON / import / clear cache).

### 6. Modals
- **Command Palette (`⌘K`)** — full-screen overlay, search input, results grouped by source (Open Tabs / Bookmarks / Reading List / History), keyboard nav with ↑↓ + Enter, `@all` prefix to search across everything
- **Smart Save (`⌘D`)** — folder picker dropdown with "Suggested" highlighted, tag chip input, save button
- **Snapshots** — list of saved tab sessions, restore/delete/rename per row, "Save current session" button at top

### 7. Sidebar (always visible, 220px / 60px collapsed)
- Brand mark + "TabMark" / "New Tab Hub" tagline
- Nav: Tabs, Bookmarks, Read Later, Health Check (each with mono count badge)
- Footer: Snapshots button + Settings cog

---

## Interactions & Behavior

### Keyboard shortcuts
| Key | Action |
|---|---|
| `⌘K` | Open Command Palette (global search) |
| `⌘D` | Open Smart Save modal |
| `⌘⇧B` | Open Command Palette (alternate) |
| `Esc` | Clear search query / deselect / close modal |
| `↑↓ + Enter` | Navigate palette results |
| Type `@all <query>` in any search | Auto-trigger global palette |

### Animations
- NTP collapse: `padding`, `height`, `border-radius`, `font-size`, `gap`, `max-height`, `opacity` all transition 0.25s ease
- Toast: slides up from bottom-left, auto-dismiss 4s, optional Undo button
- Health scan: progress bar fills smoothly via `setInterval` 50ms tick
- Tab card hover: action buttons fade in (opacity 0→1, 0.12s)

### NTP daily doodle
On the Tabs view, the hero shows one of 6 brand-mark variants (Stack / Folded / Tabline / Constellation / Bookrest / Mono). Variant is selected by a deterministic hash of `YYYYMMDD` so it rotates at local midnight. See `tabmark-logo.jsx`.

### Hibernation
"Hibernated" tabs render with reduced opacity (0.55) and a paused indicator. In the real extension, tie this to `chrome.tabs.discard()`.

### Theme
**Always follows browser system preference** via `prefers-color-scheme`. No manual override. The `data-theme="dark"` attribute on `<html>` is set by a `matchMedia` listener.

### i18n
EN ↔ 中文 toggle in Settings only. All visible strings come from `i18n.jsx` (`useT(lang)` hook). New strings must be added to both locales.

---

## State Management

The prototype uses a single `useState` blob in `App` for simplicity. For production, recommend Zustand or Redux Toolkit with these slices:

```ts
type AppState = {
  view: "tabs" | "bookmarks" | "readlater" | "health" | "settings";
  lang: "en" | "zh";
  query: string;                    // current view filter
  tabs: Tab[];                      // from chrome.tabs.query
  topSites: Site[];                 // from chrome.topSites.get
  recentlyClosed: ClosedTab[];      // from chrome.sessions.getRecentlyClosed
  bookmarkTree: BookmarkNode[];     // from chrome.bookmarks.getTree
  currentFolder: string;
  viewMode: "list" | "grid";
  selectedTags: string[];
  selectedBookmarks: string[];
  readingList: ReadItem[];          // from chrome.readingList.query (MV3)
  history: HistoryItem[];           // from chrome.history.search
  health: { dead: Bookmark[]; dupes: Bookmark[] };
  snapshots: Snapshot[];            // from chrome.storage.local
  // modal state
  paletteOpen: boolean;
  smartSaveOpen: boolean;
  snapshotsOpen: boolean;
  toast: { msg: string; undoable?: boolean } | null;
};
```

### Data sources (Chrome APIs to wire)
- `chrome.tabs.query({})` — open tabs
- `chrome.tabGroups.query({})` — group metadata (color, title)
- `chrome.bookmarks.getTree()` — bookmark tree
- `chrome.history.search({text:""})` — history
- `chrome.sessions.getRecentlyClosed({maxResults: 10})`
- `chrome.topSites.get()`
- `chrome.readingList.query({})` (MV3 only)
- `chrome.storage.local` — snapshots, settings, hibernation flags, custom tags
- `chrome.tabs.discard(id)` / `chrome.tabs.reload(id)` — hibernation toggle
- `chrome.bookmarks.move/create/remove` — folder ops
- `fetch(url, {method:"HEAD"})` in a service worker — health check (handle CORS via `host_permissions`)

---

## Design Tokens

### Colors (OKLCH — copy verbatim into `:root` and `[data-theme="dark"]`)
```css
/* Light */
--bg:            oklch(0.985 0.004 80);
--bg-elev:       oklch(1 0 0);
--bg-sub:        oklch(0.965 0.005 80);
--bg-hover:      oklch(0.94 0.006 80);
--bg-active:    oklch(0.92 0.008 80);
--border:        oklch(0.91 0.005 80);
--border-strong: oklch(0.85 0.008 80);
--fg:            oklch(0.22 0.01 60);    /* primary text */
--fg-2:          oklch(0.42 0.01 60);    /* secondary */
--fg-3:          oklch(0.58 0.012 60);   /* tertiary / metadata */
--fg-4:          oklch(0.72 0.012 60);   /* placeholder / disabled */
--accent:        oklch(0.68 0.14 60);    /* warm amber #D97757 */
--accent-fg:     oklch(0.18 0.04 60);
--accent-bg:     oklch(0.95 0.04 70);
--accent-border: oklch(0.82 0.09 65);
--danger:        oklch(0.6 0.18 25);
--success:       oklch(0.62 0.14 150);

/* Dark — see styles.jsx for full set */
```

### Typography
- **UI sans:** Inter — weights 400/500/600 used; `font-feature-settings: "cv11", "ss01"`
- **Mono:** JetBrains Mono — used for URLs, counts, timestamps, technical metadata, kbd badges
- Sizes: `10.5px` (mono badges) / `11px` (small caps section headers) / `12.5px` (tab cards) / `13px` (default body) / `14px` (Google search input) / `15px` (large) / `22px` (sidebar brand)
- Letter-spacing: `-0.01em` on UI headings, `0.08em` on uppercase labels, `0` on body

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 22 / 24 / 28 / 32 / 36 / 56 px — used as grid/gutter/padding values throughout. No formal scale system — match existing values.

### Radius
- `--radius-sm: 6px` — buttons, chips
- `--radius: 8px` — cards, search bar
- `--radius-lg: 12px` — modals
- `28px / 19px` — Google search bar (expanded / condensed)

### Shadows
```css
--shadow-sm: 0 1px 2px rgba(40,30,10,.04), 0 0 0 1px rgba(40,30,10,.04);
--shadow-md: 0 4px 12px rgba(40,30,10,.06), 0 0 0 1px rgba(40,30,10,.05);
--shadow-lg: 0 24px 60px rgba(40,30,10,.18), 0 0 0 1px rgba(40,30,10,.06);
```

---

## Assets

### Brand
- **TabMarkLogo** (sidebar) — small inline SVG, 22–28px, in `tabmark-logo.jsx`
- **TabMarkDoodle** — 6 daily-rotating variants in `tabmark-logo.jsx`, all original SVG
- **GoogleGlyph** — multi-color G mark, original SVG inline in `TabMark.html`. Use Google's official brand asset in production via web font or static SVG download from Google Identity guidelines.

### Icons
All icons are inline SVG in `icons.jsx` (no external icon font). Stroke 1.6, 14×14 viewBox normalized. List: Tabs / Bookmark / Read / Health / Settings / Search / Close / Chevrons / More / Hibernate / Restore / External / Clock / Star / Folder / Tag / Camera / Check / Plus / Command / Globe.

### Favicons
The prototype draws letter-mark placeholders via `favicons.jsx`. Production should use `chrome://favicon/<url>` (MV2) or fetch from `https://www.google.com/s2/favicons?domain=<host>&sz=32` for MV3.

---

## Files in this bundle

| File | Purpose |
|---|---|
| `TabMark.html` | Entry point — bootstraps React, contains `App`, `Sidebar`, `TopBar`, `NTPBar`, `Toast`, theme/i18n/keyboard glue |
| `styles.jsx` | All CSS as a single `TABMARK_CSS` template literal |
| `data.jsx` | Mock tabs / bookmarks / history / read-list / snapshots / health data |
| `i18n.jsx` | EN + 中文 translation table + `useT()` hook |
| `icons.jsx` | All inline SVG icon components |
| `favicons.jsx` | Letter-mark favicon placeholders |
| `tabmark-logo.jsx` | Sidebar mark + 6 daily doodle variants |
| `views-tabs.jsx` | Tabs view: TopSites, TabGroups, TabCard, RecentlyClosed |
| `views-bookmarks.jsx` | Bookmarks view: folder tree, tag cloud, batch ops |
| `views-other.jsx` | ReadLaterView, HealthView, SettingsView |
| `modals.jsx` | CommandPalette, SmartSaveModal, SnapshotsModal |
| `tweaks-panel.jsx` | (Prototype-only) live-tweak panel — DO NOT ship in production extension |
| `browser-window.jsx` | (Prototype-only) Chrome window chrome for screenshots |

---

## Production checklist

- [ ] Replace mock data with Chrome API calls (see "Data sources" above)
- [ ] Implement service worker for background health checks (HEAD requests with timeout + retry)
- [ ] Add `manifest.json` with permissions: `tabs`, `tabGroups`, `bookmarks`, `history`, `sessions`, `topSites`, `readingList`, `storage`, `<all_urls>` (for HEAD checks)
- [ ] Wire `chrome_url_overrides.newtab` to point to the built HTML
- [ ] Persist user state via `chrome.storage.local` (not localStorage)
- [ ] Add error boundaries around each view — Chrome API failures should not crash the whole NTP
- [ ] Test dark mode against all OKLCH values in real browser (Safari/Firefox have different OKLCH support)
- [ ] Strip out `tweaks-panel.jsx` and the Tweaks UI before shipping — it's a prototype affordance only
- [ ] Add analytics opt-in (PRD section TBD with user)
- [ ] Localize all hardcoded strings via `i18n.jsx` table — add new locales as needed
