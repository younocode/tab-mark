import { memo } from "react";
import { TabMarkLogo } from "./TabMarkLogo";
import {
  IconTabs,
  IconBookmark,
  IconSettings,
  IconCamera,
} from "./icons";
import type { Translations } from "../utils/i18n";
import type { ViewId } from "../types";

function IconRead({ size = 14 }: { size?: number }) {
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
      <path d="M2.5 3.5h4.5a2 2 0 0 1 2 2v8a2 2 0 0 0-2-2H2.5z" />
      <path d="M13.5 3.5H9a2 2 0 0 0-2 2v8a2 2 0 0 1 2-2h4.5z" />
    </svg>
  );
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

interface SidebarProps {
  view: ViewId;
  setView: (v: ViewId) => void;
  t: Translations;
  tabCount: number;
  bookmarkCount: number;
  readLaterCount: number;
  collapsed: boolean;
  onOpenSnapshots: () => void;
}

export const Sidebar = memo(function Sidebar({
  view,
  setView,
  t,
  tabCount,
  bookmarkCount,
  readLaterCount,
  collapsed,
  onOpenSnapshots,
}: SidebarProps) {
  const items: {
    id: ViewId;
    icon: React.FC<{ size?: number }>;
    label: string;
    badge?: number;
  }[] = [
    { id: "tabs", icon: IconTabs, label: t.nav.tabs, badge: tabCount },
    {
      id: "bookmarks",
      icon: IconBookmark,
      label: t.nav.bookmarks,
      badge: bookmarkCount,
    },
    {
      id: "readlater",
      icon: IconRead,
      label: t.nav.readLater,
      badge: readLaterCount,
    },
    {
      id: "health",
      icon: IconHealth,
      label: t.nav.health,
    },
  ];

  return (
    <aside className={`tm-sb ${collapsed ? "collapsed" : ""}`}>
      <div
        className="tm-sb-hd"
        style={{ flexDirection: collapsed ? "column" : "row" }}
      >
        <TabMarkLogo size={22} />
        {!collapsed && (
          <div>
            <div className="brand">{t.appName}</div>
            <div className="tag">{t.appTagline}</div>
          </div>
        )}
      </div>
      <div className="tm-sb-divider" />
      <nav className="tm-sb-nav">
        {items.map((it) => {
          const I = it.icon;
          return (
            <button
              key={it.id}
              className={`tm-sb-item ${view === it.id ? "active" : ""}`}
              onClick={() => setView(it.id)}
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <I size={14} />
              {!collapsed && (
                <>
                  <span>{it.label}</span>
                  {it.badge != null && (
                    <span className="badge">{it.badge}</span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
      <div className="tm-sb-foot">
        {!collapsed && (
          <button
            className="tm-btn ghost sm"
            style={{ flex: 1 }}
            onClick={onOpenSnapshots}
          >
            <IconCamera size={11} /> {t.tabs.snapshot}
          </button>
        )}
        <button
          className="tm-btn ghost icon sm"
          onClick={() => setView("settings")}
          title={t.nav.settings}
        >
          <IconSettings size={12} />
        </button>
      </div>
    </aside>
  );
});
