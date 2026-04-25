import { memo, useState } from "react";
import { Favicon } from "./Favicon";
import { IconExternal, IconCheck, IconTag, IconClose } from "./icons";
import { highlight, getDomain } from "../utils/search";
import { useTagStore } from "../stores/tagStore";
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
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const addTag = useTagStore((s) => s.addTag);
  const removeTag = useTagStore((s) => s.removeTag);
  const allTags = useTagStore((s) => s.getAllTags)();

  const suggestions = tagInput
    ? allTags.filter(
        (t) =>
          t.toLowerCase().includes(tagInput.toLowerCase()) &&
          !tags.includes(t),
      )
    : [];

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
        <div className="b-title">{highlight(bookmark.title, query)}</div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginTop: 2,
            flexWrap: "wrap",
          }}
        >
          <span className="b-domain">{domain}</span>
          {tags.map((tag) => (
            <span
              key={tag}
              className="tm-pill tag"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(bookmark.id, tag);
              }}
            >
              {tag}
              <IconClose size={7} />
            </span>
          ))}
          {showTagInput ? (
            <div
              style={{ position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                autoFocus
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    addTag(bookmark.id, tagInput.trim());
                    setTagInput("");
                  } else if (e.key === "Escape") {
                    setShowTagInput(false);
                    setTagInput("");
                  }
                }}
                onBlur={() => {
                  setTimeout(() => {
                    setShowTagInput(false);
                    setTagInput("");
                  }, 150);
                }}
                placeholder="tag…"
                style={{
                  width: 80,
                  height: 20,
                  border: "1px solid var(--border)",
                  borderRadius: 3,
                  background: "var(--bg-elev)",
                  color: "var(--fg)",
                  fontSize: 11,
                  padding: "0 6px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              {suggestions.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    zIndex: 10,
                    background: "var(--bg-elev)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                    boxShadow: "var(--shadow-md)",
                    padding: 2,
                    minWidth: 100,
                  }}
                >
                  {suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s}
                      className="tm-btn ghost sm"
                      style={{
                        width: "100%",
                        justifyContent: "flex-start",
                        fontSize: 11,
                      }}
                      onMouseDown={() => {
                        addTag(bookmark.id, s);
                        setTagInput("");
                        setShowTagInput(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : null}
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
            setShowTagInput(true);
          }}
          title="Add tag"
        >
          <IconTag size={11} />
        </button>
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
