import { useState, useMemo, useEffect } from "react";
import { Favicon } from "./Favicon";
import { IconCheck, IconBookmark, IconClose } from "./icons";
import { useReadingListStore } from "../stores/readingListStore";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { flattenBookmarks } from "../utils/bookmarks";
import { getDomain } from "../utils/search";
import type { Translations } from "../utils/i18n";

interface ReadLaterViewProps {
  t: Translations;
}

export function ReadLaterView({ t }: ReadLaterViewProps) {
  const entries = useReadingListStore((s) => s.entries);
  const markAsRead = useReadingListStore((s) => s.markAsRead);
  const remove = useReadingListStore((s) => s.remove);
  const bookmarkTree = useBookmarkStore((s) => s.tree);
  const [tab, setTab] = useState<"unread" | "read">("unread");

  useEffect(() => {
    useReadingListStore.getState().init();
    useBookmarkStore.getState().init();
  }, []);

  const bookmarkedUrlMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of flattenBookmarks(bookmarkTree)) {
      if (b.url && !map.has(b.url)) map.set(b.url, b.id);
    }
    return map;
  }, [bookmarkTree]);

  const filtered = useMemo(
    () =>
      entries.filter((e) =>
        tab === "unread" ? !e.hasBeenRead : e.hasBeenRead,
      ),
    [entries, tab],
  );

  const unreadCount = entries.filter((e) => !e.hasBeenRead).length;
  const readCount = entries.filter((e) => e.hasBeenRead).length;

  function formatAge(timestamp: number): string {
    const days = Math.floor((Date.now() - timestamp) / 86400000);
    if (days === 0) return t.common.just;
    if (days < 30) return `${days} ${t.common.day}`;
    return `${Math.floor(days / 30)}mo`;
  }

  return (
    <div className="tm-content" style={{ maxWidth: 800 }}>
      <div className="tm-segmented" style={{ marginBottom: 16 }}>
        <button
          className={tab === "unread" ? "active" : ""}
          onClick={() => setTab("unread")}
        >
          {t.readlater.unread} ({unreadCount})
        </button>
        <button
          className={tab === "read" ? "active" : ""}
          onClick={() => setTab("read")}
        >
          {t.readlater.read} ({readCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "var(--fg-3)",
          }}
        >
          {t.readlater.empty}
        </div>
      ) : (
        filtered.map((entry) => (
          <div
            key={entry.url}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: 12,
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              marginBottom: 6,
              opacity: entry.hasBeenRead ? 0.55 : 1,
              cursor: "pointer",
            }}
            onClick={() => chrome.tabs.create({ url: entry.url })}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: entry.hasBeenRead
                  ? "transparent"
                  : "var(--accent)",
                border: entry.hasBeenRead
                  ? "1px solid var(--border-strong)"
                  : "none",
                flexShrink: 0,
              }}
            />
            <Favicon url={entry.url} size={16} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {entry.title}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                }}
              >
                {getDomain(entry.url)}
              </div>
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                color: "var(--fg-4)",
              }}
            >
              {formatAge(entry.creationTime)}
            </span>
            <div
              style={{
                display: "flex",
                gap: 4,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {!entry.hasBeenRead && (
                <button
                  className="tm-btn ghost sm"
                  onClick={() => markAsRead(entry.url)}
                  title={t.readlater.markRead}
                >
                  <IconCheck size={11} />
                </button>
              )}
              {(() => {
                const bookmarkId = bookmarkedUrlMap.get(entry.url);
                const isBookmarked = !!bookmarkId;
                return (
                  <button
                    className="tm-btn ghost sm"
                    onClick={async () => {
                      if (bookmarkId) {
                        await chrome.bookmarks.remove(bookmarkId);
                      } else {
                        await chrome.bookmarks.create({
                          title: entry.title,
                          url: entry.url,
                        });
                      }
                    }}
                    title={isBookmarked ? t.readlater.removeBookmark : t.readlater.saveBookmark}
                    style={isBookmarked ? { color: "var(--accent)" } : undefined}
                  >
                    <IconBookmark size={11} filled={isBookmarked} />
                  </button>
                );
              })()}
              <button
                className="tm-btn ghost sm danger"
                onClick={() => remove(entry.url)}
                title={t.readlater.remove}
              >
                <IconClose size={11} />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
