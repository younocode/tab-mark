import { IconSearch, IconClose, IconGlobe } from "./icons";
import type { Translations } from "../utils/i18n";
import type { ViewId } from "../types";

interface TopBarProps {
  query: string;
  setQuery: (q: string) => void;
  t: Translations;
  view: ViewId;
  lang: string;
  onToggleLang: () => void;
}

export function TopBar({
  query,
  setQuery,
  t,
  view,
  lang,
  onToggleLang,
}: TopBarProps) {
  const placeholder =
    view === "tabs"
      ? t.search.placeholderTabs
      : view === "bookmarks"
        ? t.search.placeholderBookmarks
        : t.search.placeholderTabs;

  return (
    <div className="tm-topbar">
      <div
        className="tm-search"
        onClick={() =>
          document.getElementById("tm-search-input")?.focus()
        }
      >
        <IconSearch size={14} />
        <input
          id="tm-search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        {query && (
          <button
            className="tm-btn ghost icon sm"
            onClick={() => setQuery("")}
          >
            <IconClose size={11} />
          </button>
        )}
        <span className="kbd">{t.search.hint}</span>
      </div>
      <div className="right">
        <button className="tm-btn ghost" onClick={onToggleLang} title="Toggle language">
          <IconGlobe size={13} />
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
            }}
          >
            {lang === "en" ? "EN" : "中"}
          </span>
        </button>
      </div>
    </div>
  );
}
