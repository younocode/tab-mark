import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FolderTree } from "./FolderTree";
import { SortableBookmarkRow } from "./SortableBookmarkRow";
import { ConfirmDialog } from "./ConfirmDialog";
import { IconBookmark, IconFolder, IconClose } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
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
  const [currentFolder, setCurrentFolder] = useState("all");
  const [selectedBookmarks, setSelectedBookmarks] = useState<string[]>([]);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const q = query.replace(/^@all\s*/i, "").trim();

  const allBookmarks = useMemo(() => flattenBookmarks(tree), [tree]);
  const folders = useMemo(() => getFolders(tree), [tree]);

  const folder = useMemo(
    () =>
      currentFolder !== "all" ? getFolderById(tree, currentFolder) : null,
    [tree, currentFolder],
  );

  const pool = useMemo(() => {
    if (currentFolder === "all" || !folder) return allBookmarks;
    return (folder.children || []).filter((n) => n.url);
  }, [currentFolder, folder, allBookmarks]);

  const filtered = useMemo(
    () =>
      !q ? pool : pool.filter((b) => matchesQuery(q, b.title, b.url)),
    [pool, q],
  );

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeIdx = filtered.findIndex((b) => b.id === active.id);
      const overIdx = filtered.findIndex((b) => b.id === over.id);
      if (activeIdx === -1 || overIdx === -1) return;

      const overBookmark = filtered[overIdx];
      await chrome.bookmarks.move(active.id as string, {
        parentId: overBookmark.parentId,
        index: overIdx,
      });
    },
    [filtered],
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
        </div>

        {selectedBookmarks.length > 0 && (
          <div className="tm-batch">
            <span className="count">
              {t.bookmarks.selected(selectedBookmarks.length)}
            </span>
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
            <button
              className="tm-btn sm danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
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

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="tm-bm-list">
              {filtered.map((b) => (
                <SortableBookmarkRow
                  key={b.id}
                  bookmark={b}
                  query={q}
                  selected={selectedBookmarks.includes(b.id)}
                  onToggleSelect={() => toggleSelect(b.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

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

      {showDeleteConfirm && (
        <ConfirmDialog
          title={`Delete ${selectedBookmarks.length} bookmarks?`}
          message="This action cannot be undone. The selected bookmarks will be permanently removed."
          confirmLabel={t.bookmarks.remove}
          onConfirm={() => {
            handleBatchDelete();
            setShowDeleteConfirm(false);
          }}
          onCancel={() => setShowDeleteConfirm(false)}
          danger
        />
      )}
    </div>
  );
}
