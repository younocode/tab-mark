import { useState, useMemo, useCallback } from "react";
import { FolderTree } from "./FolderTree";
import { BookmarkRow } from "./BookmarkRow";
import { BookmarkCard } from "./BookmarkCard";
import { IconBookmark, IconTag, IconFolder, IconClose } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useTagStore } from "../stores/tagStore";
import { flattenBookmarks, getFolderById, getFolders } from "../utils/bookmarks";
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
  const addTag = useTagStore((s) => s.addTag);
  const tagsList = useTagStore((s) => s.getAllTags)();
  const [currentFolder, setCurrentFolder] = useState("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [batchTagInput, setBatchTagInput] = useState("");
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  const q = query.replace(/^@all\s*/i, "").trim();

  const allBookmarks = useMemo(() => flattenBookmarks(tree), [tree]);
  const folders = useMemo(() => getFolders(tree), [tree]);

  const folder = useMemo(
    () =>
      currentFolder !== "all" ? getFolderById(tree, currentFolder) : null,
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
      !q ? pool : pool.filter((b) => matchesQuery(q, b.title, b.url)),
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

  const handleBatchMove = useCallback(
    async (targetFolderId: string) => {
      for (const id of selectedBookmarks) {
        await chrome.bookmarks.move(id, { parentId: targetFolderId });
      }
      setSelectedBookmarks([]);
      setShowMoveMenu(false);
    },
    [selectedBookmarks],
  );

  const handleBatchAddTag = useCallback(
    async (tag: string) => {
      for (const id of selectedBookmarks) {
        await addTag(id, tag);
      }
      setBatchTagInput("");
    },
    [selectedBookmarks, addTag],
  );

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
            {currentFolder === "all" ? t.bookmarks.all : folder?.title}
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
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
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
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <input
                value={batchTagInput}
                onChange={(e) => setBatchTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && batchTagInput.trim()) {
                    handleBatchAddTag(batchTagInput.trim());
                  }
                }}
                placeholder={t.bookmarks.addTag + "…"}
                style={{
                  width: 100,
                  height: 24,
                  border: "1px solid var(--border)",
                  borderRadius: 4,
                  background: "var(--bg-sub)",
                  color: "var(--fg)",
                  fontSize: 11,
                  padding: "0 6px",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                className="tm-btn sm"
                onClick={() =>
                  batchTagInput.trim() &&
                  handleBatchAddTag(batchTagInput.trim())
                }
              >
                <IconTag size={11} /> {t.bookmarks.addTag}
              </button>
            </div>
            <div style={{ position: "relative" }}>
              <button
                className="tm-btn sm"
                onClick={() => setShowMoveMenu(!showMoveMenu)}
              >
                <IconFolder size={11} /> {t.bookmarks.move}
              </button>
              {showMoveMenu && (
                <>
                  <div
                    style={{ position: "fixed", inset: 0, zIndex: 10 }}
                    onClick={() => setShowMoveMenu(false)}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      zIndex: 11,
                      background: "var(--bg-elev)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "var(--shadow-md)",
                      padding: 4,
                      minWidth: 200,
                      maxHeight: 240,
                      overflowY: "auto",
                    }}
                  >
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        className="tm-btn ghost sm"
                        style={{
                          width: "100%",
                          justifyContent: "flex-start",
                        }}
                        onClick={() => handleBatchMove(f.id)}
                      >
                        <IconFolder size={11} /> {f.title}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
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
