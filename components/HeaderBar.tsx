import { memo } from "react";
import { TabMarkLogo } from "./TabMarkLogo";
import { IconSearch } from "./icons";
import type { Translations } from "../utils/i18n";
import type { ViewId } from "../types";

interface HeaderBarProps {
  view: ViewId;
  setView: (v: ViewId) => void;
  onOpenPalette: () => void;
  t: Translations;
  tabCount: number;
  bookmarkCount: number;
}

export const HeaderBar = memo(function HeaderBar({
  view,
  setView,
  onOpenPalette,
  t,
  tabCount,
  bookmarkCount,
}: HeaderBarProps) {
  return (
    <header className="tm-header">
      <div className="tm-header-left">
        <TabMarkLogo size={18} />
        <div className="tm-segmented">
          <button
            className={view === "home" ? "active" : ""}
            onClick={() => setView("home")}
          >
            {t.nav.home}
            <span className="tm-header-badge">{tabCount}</span>
          </button>
          <button
            className={view === "bookmarks" ? "active" : ""}
            onClick={() => setView("bookmarks")}
          >
            {t.nav.bookmarks}
            <span className="tm-header-badge">{bookmarkCount}</span>
          </button>
        </div>
      </div>
      <div className="tm-header-right">
        <button
          className="tm-header-search"
          onClick={onOpenPalette}
        >
          <IconSearch size={13} />
          <span>{t.search.placeholderAll}</span>
          <span className="tm-kbd">⌘K</span>
        </button>
      </div>
    </header>
  );
});
