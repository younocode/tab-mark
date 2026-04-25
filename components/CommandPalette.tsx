import { useState, useEffect, useRef, useMemo } from "react";
import { Favicon } from "./Favicon";
import { IconSearch, IconExternal, IconClock } from "./icons";
import { useTabStore } from "../stores/tabStore";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { flattenBookmarks } from "../utils/bookmarks";
import { matchesQuery, getDomain } from "../utils/search";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Translations } from "../utils/i18n";
import type { ToastData } from "./Toast";

interface CommandPaletteProps {
  onClose: () => void;
  t: Translations;
  showToast: (data: ToastData) => void;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  kind: "tab" | "bookmark";
}

export function CommandPalette({
  onClose,
  t,
  showToast,
}: CommandPaletteProps) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebouncedValue(q);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const tabs = useTabStore((s) => s.tabs);
  const activateTab = useTabStore((s) => s.activateTab);
  const bookmarkTree = useBookmarkStore((s) => s.tree);

  const allBookmarks = useMemo(
    () => flattenBookmarks(bookmarkTree),
    [bookmarkTree],
  );

  const tabResults = useMemo(
    () =>
      tabs
        .filter((t) => matchesQuery(debouncedQ, t.title, t.url))
        .slice(0, 5)
        .map(
          (t): SearchResult => ({
            id: `tab-${t.id}`,
            title: t.title,
            url: t.url,
            domain: getDomain(t.url),
            kind: "tab",
          }),
        ),
    [tabs, debouncedQ],
  );

  const bmResults = useMemo(
    () =>
      allBookmarks
        .filter((b) => matchesQuery(debouncedQ, b.title, b.url))
        .slice(0, 5)
        .map(
          (b): SearchResult => ({
            id: `bm-${b.id}`,
            title: b.title,
            url: b.url || "",
            domain: b.url ? getDomain(b.url) : "",
            kind: "bookmark",
          }),
        ),
    [allBookmarks, debouncedQ],
  );

  const groups: [string, SearchResult[], string][] = [
    [t.search.grpOpen, tabResults, "tab"],
    [t.search.grpBookmarks, bmResults, "bookmark"],
  ].filter(([, arr]) => arr.length > 0) as [string, SearchResult[], string][];

  const flat = [...tabResults, ...bmResults];

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(flat.length - 1, s + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(0, s - 1));
    } else if (e.key === "Enter") {
      const it = flat[sel];
      if (it) {
        onClose();
        if (it.kind === "tab") {
          const tab = tabs.find((t) => `tab-${t.id}` === it.id);
          if (tab) activateTab(tab.id, tab.windowId);
        } else {
          chrome.tabs.create({ url: it.url });
        }
      }
    }
  };

  let runningIdx = 0;

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div className="tm-cmd" onClick={(e) => e.stopPropagation()}>
        <div className="tm-cmd-input">
          <IconSearch size={16} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={onKey}
            placeholder={t.search.placeholderAll}
          />
          <span className="tm-kbd">esc</span>
        </div>
        <div className="tm-cmd-results">
          {flat.length === 0 ? (
            <div
              style={{
                padding: 30,
                textAlign: "center",
                color: "var(--fg-3)",
              }}
            >
              {t.search.noResults}
            </div>
          ) : (
            groups.map(([label, arr, kind]) => (
              <div key={label}>
                <div className="tm-cmd-group">{label}</div>
                {arr.map((it) => {
                  const idx = runningIdx++;
                  return (
                    <div
                      key={it.id}
                      className={`tm-cmd-row ${idx === sel ? "sel" : ""}`}
                      onMouseEnter={() => setSel(idx)}
                      onClick={() => {
                        onClose();
                        if (it.kind === "tab") {
                          const tab = tabs.find(
                            (t) => `tab-${t.id}` === it.id,
                          );
                          if (tab)
                            activateTab(tab.id, tab.windowId);
                        } else {
                          chrome.tabs.create({ url: it.url });
                        }
                      }}
                    >
                      <Favicon url={it.url} size={14} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tm-tab-title">{it.title}</div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            color: "var(--fg-3)",
                          }}
                        >
                          {it.domain}
                        </div>
                      </div>
                      {it.kind === "tab" && <IconExternal size={11} />}
                      <span className="src">{label}</span>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
        <div className="tm-cmd-foot">
          <span>
            <span className="kbd">↑↓</span> navigate
          </span>
          <span>
            <span className="kbd">↵</span> open
          </span>
          <span>
            <span className="kbd">@all</span>{" "}
            {t.search.allHint.split("@all").pop()}
          </span>
        </div>
      </div>
    </div>
  );
}
