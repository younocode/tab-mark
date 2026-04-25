import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTheme } from "../useTheme";

function mockMatchMedia(matches: boolean) {
  const listeners: Array<(e: { matches: boolean }) => void> = [];
  const mql = {
    matches,
    addEventListener: vi.fn((_, handler) => { listeners.push(handler); }),
    removeEventListener: vi.fn((_, handler) => {
      const idx = listeners.indexOf(handler);
      if (idx !== -1) listeners.splice(idx, 1);
    }),
    _fire: (newMatches: boolean) => {
      for (const l of listeners) l({ matches: newMatches });
    },
    _listeners: listeners,
  };
  window.matchMedia = vi.fn(() => mql as any);
  return mql;
}

describe("useTheme", () => {
  let originalSetAttribute: typeof document.documentElement.setAttribute;

  beforeEach(() => {
    originalSetAttribute = document.documentElement.setAttribute.bind(document.documentElement);
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  it("sets data-theme to light", () => {
    renderHook(() => useTheme("light"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("sets data-theme to dark", () => {
    renderHook(() => useTheme("dark"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("follows system preference when theme is system (dark)", () => {
    mockMatchMedia(true);
    renderHook(() => useTheme("system"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("follows system preference when theme is system (light)", () => {
    mockMatchMedia(false);
    renderHook(() => useTheme("system"));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("cleans up event listener on unmount", () => {
    const mql = mockMatchMedia(false);
    const { unmount } = renderHook(() => useTheme("system"));
    expect(mql.addEventListener).toHaveBeenCalledTimes(1);
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1);
  });

  it("does not add listener for non-system themes", () => {
    const mql = mockMatchMedia(false);
    renderHook(() => useTheme("dark"));
    expect(mql.addEventListener).not.toHaveBeenCalled();
  });
});
