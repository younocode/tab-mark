import { useState } from "react";
import { Favicon } from "./Favicon";
import { IconRestore } from "./icons";
import type { Translations } from "../utils/i18n";
import type { RecentlyClosed as RC } from "../types";

interface RecentlyClosedProps {
  items: RC[];
  t: Translations;
  onRestore: (sessionId: string) => void;
}

function formatTime(lastModified: number, t: Translations): string {
  const diff = Math.floor((Date.now() / 1000 - lastModified) / 60);
  if (diff < 1) return t.common.just;
  if (diff < 60) return `${diff} ${t.common.min}`;
  if (diff < 1440) return `${Math.floor(diff / 60)} ${t.common.hour}`;
  return `${Math.floor(diff / 1440)} ${t.common.day}`;
}

export function RecentlyClosedList({
  items,
  t,
  onRestore,
}: RecentlyClosedProps) {
  const [expanded, setExpanded] = useState(false);

  const tabItems = items.filter((rc) => rc.tab);
  if (tabItems.length === 0) return null;

  const visible = tabItems.slice(0, expanded ? 20 : 5);

  return (
    <div className="tm-section" style={{ marginTop: 32 }}>
      <div className="tm-section-hd">
        <h2>{t.tabs.recentlyClosed}</h2>
        <span className="meta">{tabItems.length}</span>
      </div>
      <div className="tm-rc-list">
        {visible.map((rc) => {
          const tab = rc.tab!;
          return (
            <div key={rc.sessionId || tab.tabId} className="tm-rc-item">
              <Favicon url={tab.url} size={14} />
              <span className="tm-tab-title">{tab.title}</span>
              <span className="tm-tab-meta">
                {tab.url
                  ? new URL(tab.url).hostname.replace(/^www\./, "")
                  : ""}
              </span>
              <span className="tm-rc-time">
                {formatTime(rc.lastModified, t)}
              </span>
              {rc.sessionId && (
                <button
                  className="tm-btn sm tm-rc-restore"
                  onClick={() => onRestore(rc.sessionId!)}
                >
                  <IconRestore size={11} /> {t.tabs.restore}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {tabItems.length > 5 && (
        <button
          className="tm-btn ghost sm"
          style={{ marginTop: 6 }}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? t.tabs.showLess : t.tabs.showMore}
        </button>
      )}
    </div>
  );
}
