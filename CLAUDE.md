# TabMark — Development Guide

## Overview
TabMark is a Chrome extension (Manifest V3) that replaces the new tab page, unifying tabs, bookmarks, and reading list into a single interface.

## Tech Stack
- **Framework**: [WXT](https://wxt.dev/) — Next-gen Web Extension Framework
- **UI**: React 19 + TypeScript
- **State**: Zustand (one store per Chrome API domain)
- **Styling**: Tailwind CSS v4 utilities + CSS custom properties (OKLCH design tokens)
- **Build**: Vite (via WXT)

## Commands
```bash
pnpm dev          # Start dev mode with hot reload (Chrome)
pnpm build        # Production build
pnpm zip          # Build + zip for Chrome Web Store
```

## Directory Structure
```
entrypoints/
  newtab/           # New tab page (main UI)
    index.html
    main.tsx
    App.tsx
  background.ts     # Service worker
components/         # Shared UI components
stores/             # Zustand stores (one per Chrome API)
utils/              # Pure utility functions
hooks/              # Custom React hooks
styles/
  global.css        # Tailwind entry + design tokens
types/
  index.ts          # Shared TypeScript types
public/
  icon/             # Extension icons
docs/               # Architecture & development docs
```

## Architecture Decisions
- **Store splitting**: Each Chrome API gets its own Zustand store to avoid cross-domain re-renders
- **Lazy loading**: bookmarkStore only initializes when user navigates to Bookmarks view
- **Theme**: `[data-theme="dark"]` attribute on `<html>`, CSS custom properties for all colors
- **CSS strategy**: Tailwind for layout/spacing, CSS custom properties for design tokens (colors, shadows, radii)
- **Favicon**: Uses Chrome's `_favicon/` API (MV3) with letter-tile fallback
- **i18n**: Simple key-value translation map, no heavy i18n library

## Key Conventions
- Components use named exports, one component per file
- Stores export a `use<Name>Store` hook created by `create()`
- All Chrome API calls are wrapped in store actions, never called directly from components
- Search is substring matching in Phase 1 (no Fuse.js yet)
