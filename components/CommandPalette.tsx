import { useState, useEffect, useRef, useMemo } from "react";
import { Favicon } from "./Favicon";
import { IconSearch, IconExternal, IconClock, IconBookmark, IconSettings, IconGlobe } from "./icons";
import { useTabStore } from "../stores/tabStore";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useReadingListStore } from "../stores/readingListStore";
import { buildParentPathLookup, flattenBookmarks } from "../utils/bookmarks";
import { matchesQuery, getDomain } from "../utils/search";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Translations } from "../utils/i18n";
import type { ToastData } from "./Toast";

export type PaletteAction = "deadLinks" | "duplicateBookmarks" | "settings";

interface CommandPaletteProps {
  onClose: () => void;
  onAction?: (action: PaletteAction) => void;
  initialQuery?: string;
  t: Translations;
  showToast: (data: ToastData) => void;
}

interface SearchResult {
  id: string;
  title: string;
  url: string;
  domain: string;
  kind: "tab" | "bookmark" | "readlater" | "history" | "action" | "web";
  action?: PaletteAction;
  description?: string;
  folderPath?: string;
  keywords?: string[];
}

function IconHealth({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 8h2.5l1.5-3 2 6 1.5-3H14" />
    </svg>
  );
}

export function CommandPalette({
  onClose,
  onAction,
  initialQuery = "",
  t,
  showToast,
}: CommandPaletteProps) {
  const [q, setQ] = useState(initialQuery);
  const [sel, setSel] = useState(0);
  const [historyResults, setHistoryResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQ = useDebouncedValue(q);

  useEffect(() => {
    inputRef.current?.focus();
    useBookmarkStore.getState().init();
  }, []);

  const tabs = useTabStore((s) => s.tabs);
  const activateTab = useTabStore((s) => s.activateTab);
  const bookmarkTree = useBookmarkStore((s) => s.tree);
  const readingList = useReadingListStore((s) => s.entries);

  const allBookmarks = useMemo(
    () => flattenBookmarks(bookmarkTree),
    [bookmarkTree],
  );

  const getBookmarkPath = useMemo(
    () => buildParentPathLookup(bookmarkTree),
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
        .filter((b) => matchesQuery(debouncedQ, b.title, b.url, getBookmarkPath(b.id)))
        .slice(0, 5)
        .map(
          (b): SearchResult => ({
            id: `bm-${b.id}`,
            title: b.title,
            url: b.url || "",
            domain: b.url ? getDomain(b.url) : "",
            kind: "bookmark",
            folderPath: getBookmarkPath(b.id),
          }),
        ),
    [allBookmarks, debouncedQ, getBookmarkPath],
  );

  const rlResults = useMemo(
    () =>
      readingList
        .filter((r) => matchesQuery(debouncedQ, r.title, r.url))
        .slice(0, 3)
        .map(
          (r): SearchResult => ({
            id: `rl-${r.url}`,
            title: r.title,
            url: r.url,
            domain: getDomain(r.url),
            kind: "readlater",
          }),
        ),
    [readingList, debouncedQ],
  );

  useEffect(() => {
    if (!debouncedQ || !chrome.history) {
      setHistoryResults([]);
      return;
    }
    chrome.history
      .search({ text: debouncedQ, maxResults: 5 })
      .then((items) => {
        setHistoryResults(
          items
            .filter((h) => h.url && h.title)
            .map(
              (h): SearchResult => ({
                id: `hi-${h.url}`,
                title: h.title!,
                url: h.url!,
                domain: getDomain(h.url!),
                kind: "history",
              }),
            ),
        );
      });
  }, [debouncedQ]);

  const actionItems = useMemo((): SearchResult[] => {
    const all: SearchResult[] = [
      {
        id: "action-dead-links",
        title: t.cmdActions.deadLinks,
        url: "",
        domain: t.cmdActions.deadLinksDesc,
        kind: "action",
        action: "deadLinks",
        description: t.cmdActions.deadLinksDesc,
        keywords: ["health", "dead", "deadlink", "dead link", "broken", "死链", "失效"],
      },
      {
        id: "action-duplicate-bookmarks",
        title: t.cmdActions.duplicateBookmarks,
        url: "",
        domain: t.cmdActions.duplicateBookmarksDesc,
        kind: "action",
        action: "duplicateBookmarks",
        description: t.cmdActions.duplicateBookmarksDesc,
        keywords: ["health", "duplicate", "duplicates", "dup", "重复", "重复书签"],
      },
      {
        id: "action-settings",
        title: t.cmdActions.settings,
        url: "",
        domain: t.cmdActions.settingsDesc,
        kind: "action",
        action: "settings",
        description: t.cmdActions.settingsDesc,
      },
    ];
    if (!debouncedQ) return all;
    const lq = debouncedQ.toLowerCase();
    return all.filter(
      (a) =>
        a.title.toLowerCase().includes(lq) ||
        a.description!.toLowerCase().includes(lq) ||
        a.keywords?.some((keyword) => keyword.toLowerCase().includes(lq)),
    );
  }, [t, debouncedQ]);

  const webResults = useMemo((): SearchResult[] => {
    const query = debouncedQ.trim();
    if (!query) return [];
    return [
      {
        id: `web-${query}`,
        title: `${t.search.webSearch} "${query}"`,
        url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        domain: t.search.grpWeb,
        kind: "web",
      },
    ];
  }, [debouncedQ, t]);

  const groups: [string, SearchResult[]][] = [
    [t.search.grpOpen, tabResults],
    [t.search.grpBookmarks, bmResults],
    [t.search.grpReadLater, rlResults],
    [t.search.grpHistory, historyResults],
    [t.search.grpWeb, webResults],
    ["Actions", actionItems],
  ].filter(([, arr]) => arr.length > 0) as [string, SearchResult[]][];

  const flat = [
    ...tabResults,
    ...bmResults,
    ...rlResults,
    ...historyResults,
    ...webResults,
    ...actionItems,
  ];

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
        if (it.kind === "action" && it.action && onAction) {
          onAction(it.action);
        } else if (it.kind === "tab") {
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
            groups.map(([label, arr]) => (
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
                        if (it.kind === "action" && it.action && onAction) {
                          onAction(it.action);
                        } else if (it.kind === "tab") {
                          const tab = tabs.find(
                            (t) => `tab-${t.id}` === it.id,
                          );
                          if (tab) activateTab(tab.id, tab.windowId);
                        } else {
                          chrome.tabs.create({ url: it.url });
                        }
                      }}
                    >
                      {it.kind === "action" ? (
                        it.action === "deadLinks" || it.action === "duplicateBookmarks" ? <IconHealth size={14} /> :
                        <IconSettings size={14} />
                      ) : it.kind === "web" ? (
                        <IconGlobe size={14} />
                      ) : (
                        <Favicon url={it.url} size={14} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="tm-tab-title">{it.title}</div>
                        <div
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 10.5,
                            color: "var(--fg-3)",
                          }}
                        >
                          <span title={it.url || it.domain}>
                            {it.domain}
                          </span>
                          {it.kind === "bookmark" && it.folderPath && (
                            <span title={it.folderPath}>
                              {" · "}
                              {it.folderPath}
                            </span>
                          )}
                        </div>
                      </div>
                      {it.kind === "tab" && <IconExternal size={11} />}
                      {it.kind === "history" && <IconClock size={11} />}
                      {it.kind === "readlater" && <IconBookmark size={11} />}
                      {it.kind === "web" && <IconGlobe size={11} />}
                      {it.kind !== "action" && <span className="src">{label}</span>}
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
            <span className="kbd">tab</span> actions
          </span>
        </div>
      </div>
    </div>
  );
}
