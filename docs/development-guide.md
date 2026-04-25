# Development Guide

## Getting Started

```bash
pnpm install
pnpm dev          # Opens Chrome with extension loaded
```

WXT will open a new Chrome window with the extension installed. The new tab page is automatically overridden.

## Build & Package

```bash
pnpm build        # Production build → .output/chrome-mv3/
pnpm zip          # Build + create .zip for Chrome Web Store
```

## CSS Strategy

We use a hybrid approach:
1. **Tailwind CSS v4** for layout, spacing, flexbox, grid
2. **CSS custom properties** for design tokens (colors, shadows, radii, fonts)

This lets the design system's 370-line OKLCH token set live in CSS variables where it naturally belongs, while Tailwind handles the structural CSS.

```css
/* Use Tailwind for layout */
<div className="flex items-center gap-3 p-4">

/* Use CSS variables for theming */
<div style={{ background: 'var(--bg-elev)', color: 'var(--fg)' }}>

/* Or combine via CSS classes */
.tm-tab-card { /* design tokens + layout in one class */ }
```

## Chrome API Testing

Since Chrome APIs are only available in the extension context:
- Use `pnpm dev` to test with real Chrome APIs
- The dev mode supports hot reload for UI changes
- Service worker changes require manual reload via `chrome://extensions`

## Project Conventions

- One component per file, named export
- Stores: `use<Name>Store` via Zustand's `create()`
- Never call Chrome APIs directly from components — always through store actions
- CSS class prefix: `tm-` (TabMark namespace)
