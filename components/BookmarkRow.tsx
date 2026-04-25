import { memo } from "react";
import { Favicon } from "./Favicon";
import { IconExternal, IconCheck } from "./icons";
import { highlight, getDomain } from "../utils/search";
import type { BookmarkNode } from "../types";

interface BookmarkRowProps {
  bookmark: BookmarkNode;
  query: string;
  selected: boolean;
  onToggleSelect: () => void;
  tags: string[];
}

export const BookmarkRow = memo(function BookmarkRow({
  bookmark,
  query,
  selected,
  onToggleSelect,
  tags,
}: BookmarkRowProps) {
  const domain = bookmark.url ? getDomain(bookmark.url) : "";

  return (
    <div
      className={`tm-bm-row ${selected ? "selected" : ""}`}
      onClick={onToggleSelect}
    >
      <span className={`tm-check ${selected ? "checked" : ""}`}>
        <IconCheck size={9} />
      </span>
      <Favicon url={bookmark.url} size={14} />
      <div style={{ minWidth: 0 }}>
        <div className="b-title">
          {highlight(bookmark.title, query)}
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <span className="b-domain">{domain}</span>
          {tags.length > 0 && (
            <div className="b-tags">
              {tags.map((tag) => (
                <span key={tag} className="tm-pill tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <span className="b-meta">
        {bookmark.dateAdded
          ? new Date(bookmark.dateAdded).toLocaleDateString()
          : ""}
      </span>
      <div className="b-actions">
        <button
          className="tm-btn ghost icon sm"
          onClick={(e) => {
            e.stopPropagation();
            if (bookmark.url) chrome.tabs.create({ url: bookmark.url });
          }}
        >
          <IconExternal size={11} />
        </button>
      </div>
    </div>
  );
});
