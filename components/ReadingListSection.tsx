import { useState, useMemo } from "react";
import { Favicon } from "./Favicon";
import { IconCheck, IconClose } from "./icons";
import { useReadingListStore } from "../stores/readingListStore";
import { getDomain } from "../utils/search";
import type { Translations } from "../utils/i18n";

interface ReadingListSectionProps {
  t: Translations;
}

const DEFAULT_VISIBLE = 5;

export function ReadingListSection({ t }: ReadingListSectionProps) {
  const entries = useReadingListStore((s) => s.entries);
  const markAsRead = useReadingListStore((s) => s.markAsRead);
  const remove = useReadingListStore((s) => s.remove);
  const [showAll, setShowAll] = useState(false);
  const [showRead, setShowRead] = useState(false);

  const unread = useMemo(
    () => entries.filter((e) => !e.hasBeenRead),
    [entries],
  );

  const pool = showRead ? entries : unread;

  if (pool.length === 0) return null;

  const visible = showAll ? pool : pool.slice(0, DEFAULT_VISIBLE);
  const hasMore = pool.length > DEFAULT_VISIBLE;

  function formatAge(timestamp: number): string {
    const days = Math.floor((Date.now() - timestamp) / 86400000);
    if (days === 0) return t.common.just;
    if (days < 30) return `${days} ${t.common.day}`;
    return `${Math.floor(days / 30)}mo`;
  }

  return (
    <div className="tm-section">
      <div className="tm-section-hd">
        <h2>{t.nav.readLater}</h2>
        <span className="meta">{unread.length}</span>
        <div className="actions" style={{ opacity: 1 }}>
          <button
            className={`tm-btn ghost sm ${showRead ? "active" : ""}`}
            onClick={() => setShowRead(!showRead)}
            style={{ fontSize: 11 }}
          >
            {showRead ? t.readlater.unread : t.readlater.read}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {visible.map((entry) => {
          const domain = getDomain(entry.url);

          return (
            <div
              key={entry.url}
              className="tm-rl-item"
              style={{ opacity: entry.hasBeenRead ? 0.55 : 1 }}
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
            <Favicon url={entry.url} size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {entry.title}
              </div>
            </div>
              <span
                title={entry.url}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  color: "var(--fg-4)",
                  flexShrink: 0,
                }}
              >
                {domain}
              </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--fg-4)",
                flexShrink: 0,
              }}
            >
              {formatAge(entry.creationTime)}
            </span>
            <div
              style={{ display: "flex", gap: 2 }}
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
              <button
                className="tm-btn ghost sm danger"
                onClick={() => remove(entry.url)}
                title={t.readlater.remove}
              >
                <IconClose size={11} />
              </button>
            </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button
          className="tm-btn ghost sm"
          style={{ marginTop: 6 }}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? t.tabs.showLess : t.tabs.showMore}
        </button>
      )}
    </div>
  );
}
