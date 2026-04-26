# TabMark

Chrome extension that replaces the new tab page, unifying tabs, bookmarks, and reading list into a single interface.

Built with [WXT](https://wxt.dev/), React 19, Zustand, and Tailwind CSS v4.

## Features

- **Unified home view** — open tabs, top sites, reading list, and recently closed tabs in one place
- **Command palette** — `Cmd+K` to search across tabs, bookmarks, reading list, history, and the web
- **Bookmark health checks** — scan for dead links and duplicate bookmarks
- **Reading list** — manage Chrome's built-in reading list with read/unread filtering
- **Tab groups** — view and manage Chrome tab groups, with domain-based auto-grouping
- **Dark mode** — system-aware theme with light/dark toggle
- **i18n** — English and Chinese (Simplified)

## Getting Started

```bash
pnpm install
pnpm dev          # Start dev mode with hot reload (Chrome)
```

Load the extension from `.output/chrome-mv3` in `chrome://extensions` with developer mode enabled.

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Dev mode with hot reload |
| `pnpm build` | Production build |
| `pnpm zip` | Build + zip for Chrome Web Store |
| `pnpm test` | Run tests in watch mode |
| `pnpm test:run` | Run tests once |

## Project Structure

```
entrypoints/
  newtab/         New tab page (main UI entry)
  background.ts   Service worker
  content.ts      Content script
components/       UI components
stores/           Zustand stores (one per Chrome API domain)
utils/            Pure utility functions
hooks/            Custom React hooks
styles/
  global.css      Tailwind entry + OKLCH design tokens
types/
  index.ts        Shared TypeScript types
```

## Architecture

- **One store per Chrome API** — `tabStore`, `bookmarkStore`, `readingListStore`, etc. to avoid cross-domain re-renders
- **Lazy loading** — `bookmarkStore` only initializes when needed
- **All Chrome API calls** go through store actions, never called directly from components
- **CSS strategy** — Tailwind for layout/spacing, CSS custom properties (OKLCH) for design tokens
- **Favicon** — Chrome's `_favicon/` API (MV3) with letter-tile fallback

## Permissions

`bookmarks` `tabs` `tabGroups` `favicon` `storage` `sessions` `topSites` `readingList` `history` `activeTab` `scripting`

## License

[MIT](LICENSE)
