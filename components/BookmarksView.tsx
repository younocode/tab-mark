import { useState, useMemo, useCallback } from "react";
import { FolderTree } from "./FolderTree";
import { BookmarkRow } from "./BookmarkRow";
import { BookmarkCard } from "./BookmarkCard";
import { IconBookmark, IconTag, IconFolder, IconClose } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useTagStore } from "../stores/tagStore";
import { flattenBookmarks, getFolderById } from "../utils/bookmarks";
import { matchesQuery } from "../utils/search";
import type { Translations } from "../utils/i18n";

interface BookmarksViewProps {
  query: string;
  t: Translations;
}

export function BookmarksView({ query, t }: BookmarksViewProps) {
  const tree = useBookmarkStore((s) => s.tree);
  const initialized = useBookmarkStore((s) => s.initialized);
  const allTags = useTagStore((s) => s.tags);
  const tagsList = useTagStore((s) => s.getAllTags)();
  const [currentFolder, setCurrentFolder] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);

  const q = query.replace(/^@all\s*/i, "").trim();

  const allBookmarks = useMemo(
    () => flattenBookmarks(tree),
    [tree],
  );

  const folder = useMemo(
    () =>
      currentFolder !== "all"
        ? getFolderById(tree, currentFolder)
        : null,
    [tree, currentFolder],
  );

  const pool = useMemo(() => {
    let items =
      currentFolder === "all" || !folder
        ? allBookmarks
        : (folder.children || []).filter((n) => n.url);

    if (selectedTags.length > 0) {
      items = items.filter((b) => {
        const bTags = allTags[b.id] || [];
        return selectedTags.every((tag) => bTags.includes(tag));
      });
    }

    return items;
  }, [currentFolder, folder, allBookmarks, selectedTags, allTags]);

  const filtered = useMemo(
    () =>
      !q
        ? pool
        : pool.filter((b) =>
            matchesQuery(q, b.title, b.url),
          ),
    [pool, q],
  );

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleSelect = (id: string) => {
    setSelectedBookmarks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleBatchDelete = useCallback(async () => {
    for (const id of selectedBookmarks) {
      await chrome.bookmarks.remove(id);
    }
    setSelectedBookmarks([]);
  }, [selectedBookmarks]);

  if (!initialized) {
    return (
      <div
        className="tm-content"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--fg-3)",
        }}
      >
        Loading bookmarks…
      </div>
    );
  }

  return (
    <div className="tm-content bookmarks">
      <aside className="tm-bm-side">
        <button
          className={`tm-bm-folder ${currentFolder === "all" ? "active" : ""}`}
          onClick={() => setCurrentFolder("all")}
        >
          <IconBookmark size={12} />
          <span>{t.bookmarks.all}</span>
          <span className="count">{allBookmarks.length}</span>
        </button>
        <h4>{t.bookmarks.folders}</h4>
        <FolderTree
          tree={tree}
          current={currentFolder}
          onSelect={setCurrentFolder}
        />
        {tagsList.length > 0 && (
          <>
            <h4>Tags</h4>
            <div className="tm-bm-tags">
              {tagsList.map((tag) => (
                <button
                  key={tag}
                  className={`tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
      <main className="tm-bm-main">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {currentFolder === "all"
              ? t.bookmarks.all
              : folder?.title}
          </h2>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11.5,
              color: "var(--fg-3)",
            }}
          >
            {t.bookmarks.count(filtered.length)}
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 8,
            }}
          >
            <div className="tm-segmented">
              <button
                className={viewMode === "list" ? "active" : ""}
                onClick={() => setViewMode("list")}
              >
                {t.bookmarks.list}
              </button>
              <button
                className={viewMode === "grid" ? "active" : ""}
                onClick={() => setViewMode("grid")}
              >
                {t.bookmarks.grid}
              </button>
            </div>
          </div>
        </div>

        {selectedBookmarks.length > 0 && (
          <div className="tm-batch">
            <span className="count">
              {t.bookmarks.selected(selectedBookmarks.length)}
            </span>
            <button className="tm-btn sm danger" onClick={handleBatchDelete}>
              <IconClose size={11} /> {t.bookmarks.remove}
            </button>
            <button
              className="tm-btn ghost sm"
              style={{ marginLeft: "auto" }}
              onClick={() => setSelectedBookmarks([])}
            >
              {t.common.close}
            </button>
          </div>
        )}

        {viewMode === "list" ? (
          <div className="tm-bm-list">
            {filtered.map((b) => (
              <BookmarkRow
                key={b.id}
                bookmark={b}
                query={q}
                selected={selectedBookmarks.includes(b.id)}
                onToggleSelect={() => toggleSelect(b.id)}
                tags={allTags[b.id] || []}
              />
            ))}
          </div>
        ) : (
          <div className="tm-bm-grid">
            {filtered.map((b) => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                query={q}
                tags={allTags[b.id] || []}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <div
            style={{
              padding: "60px 20px",
              textAlign: "center",
              color: "var(--fg-3)",
            }}
          >
            {q ? t.search.noResults : t.empty.bookmarks}
          </div>
        )}
      </main>
    </div>
  );
}
