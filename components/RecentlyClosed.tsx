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
  if (items.length === 0) return null;

  const tabItems = items
    .filter((rc) => rc.tab)
    .slice(0, 10);

  return (
    <div className="tm-section" style={{ marginTop: 32 }}>
      <div className="tm-section-hd">
        <h2>{t.tabs.recentlyClosed}</h2>
        <span className="meta">{tabItems.length}</span>
      </div>
      <div className="tm-rc-list">
        {tabItems.map((rc) => {
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
    </div>
  );
}
