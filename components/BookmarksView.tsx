import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  type DragStartEvent,
  type DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { FolderTree } from "./FolderTree";
import { SortableBookmarkRow } from "./SortableBookmarkRow";
import { DragOverlayContent } from "./DragOverlayContent";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";
import { EditBookmarkDialog } from "./EditBookmarkDialog";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  IconBookmark,
  IconExternal,
  IconEdit,
  IconClose,
  IconCopy,
  IconFolder,
} from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { flattenBookmarks, getFolderById, getFolders } from "../utils/bookmarks";
import { matchesQuery } from "../utils/search";
import { bmDndId, parseDndId } from "../utils/dndIds";
import type { BookmarkNode } from "../types";
import type { ToastData } from "./Toast";
import type { Translations } from "../utils/i18n";

interface BookmarksViewProps {
  query: string;
  t: Translations;
  showToast: (data: ToastData) => void;
}

const customCollision: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};

const dropAnimConfig = {
  duration: 200,
  easing: "cubic-bezier(0.25, 1, 0.5, 1)",
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0" } },
  }),
};

export function BookmarksView({ query, t, showToast }: BookmarksViewProps) {
  const tree = useBookmarkStore((s) => s.tree);
  const initialized = useBookmarkStore((s) => s.initialized);
  const removeBookmark = useBookmarkStore((s) => s.removeBookmark);
  const removeTree = useBookmarkStore((s) => s.removeTree);
  const createFolder = useBookmarkStore((s) => s.createFolder);
  const [currentFolder, setCurrentFolder] = useState("all");

  const [ctxMenu, setCtxMenu] = useState<{
    x: number;
    y: number;
    bookmark?: BookmarkNode;
    folder?: BookmarkNode;
  } | null>(null);
  const [editTarget, setEditTarget] = useState<BookmarkNode | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<BookmarkNode | null>(null);
  const [activeDrag, setActiveDrag] = useState<{
    type: "bookmark" | "folder";
    node: BookmarkNode;
  } | null>(null);

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as
      | { type: "bookmark" | "folder"; node: BookmarkNode }
      | undefined;
    if (data) {
      setActiveDrag({ type: data.type, node: data.node });
      document.body.classList.add("tm-dragging");
    }
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDrag(null);
      document.body.classList.remove("tm-dragging");
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const activeData = active.data.current as
        | { type: "bookmark" | "folder"; node: BookmarkNode }
        | undefined;
      const overData = over.data.current as
        | { type: "bookmark" | "folder"; node: BookmarkNode }
        | undefined;

      if (!activeData) return;

      const activeParsed = parseDndId(active.id as string);
      const overParsed = parseDndId(over.id as string);

      if (activeData.type === "bookmark" && overData?.type === "folder") {
        try {
          await chrome.bookmarks.move(activeParsed.chromeId, {
            parentId: overParsed.chromeId,
          });
        } catch {
          showToast({ msg: t.bookmarks.moveFailed, type: "error" });
        }
        return;
      }

      if (activeData.type === "folder" && overData?.type === "folder") {
        if (activeParsed.chromeId === overParsed.chromeId) return;
        try {
          await chrome.bookmarks.move(activeParsed.chromeId, {
            parentId: overParsed.chromeId,
          });
        } catch {
          showToast({ msg: t.bookmarks.moveFailed, type: "error" });
        }
        return;
      }

      if (activeData.type === "bookmark" && overParsed.type === "bookmark") {
        const overIdx = filtered.findIndex(
          (b) => b.id === overParsed.chromeId,
        );
        if (overIdx === -1) return;
        const overBookmark = filtered[overIdx];
        try {
          await chrome.bookmarks.move(activeParsed.chromeId, {
            parentId: overBookmark.parentId,
            index: overIdx,
          });
        } catch {
          showToast({ msg: t.bookmarks.moveFailed, type: "error" });
        }
      }
    },
    [filtered, showToast, t.bookmarks.moveFailed],
  );

  const handleDragCancel = useCallback(() => {
    setActiveDrag(null);
    document.body.classList.remove("tm-dragging");
  }, []);

  const buildBookmarkMenuItems = (bm: BookmarkNode): ContextMenuItem[] => [
    {
      label: t.contextMenu.openNewTab,
      icon: <IconExternal size={13} />,
      onClick: () => chrome.tabs.create({ url: bm.url }),
    },
    {
      label: t.contextMenu.openNewWindow,
      onClick: () => chrome.windows.create({ url: bm.url }),
    },
    {
      label: t.contextMenu.openIncognito,
      onClick: () => {
        try {
          chrome.windows.create({ url: bm.url, incognito: true });
        } catch {
          /* incognito access not granted */
        }
      },
    },
    { type: "separator" },
    {
      label: t.contextMenu.edit,
      icon: <IconEdit size={13} />,
      onClick: () => setEditTarget(bm),
    },
    {
      label: t.contextMenu.delete,
      icon: <IconClose size={13} />,
      danger: true,
      onClick: () => removeBookmark(bm.id),
    },
    { type: "separator" },
    {
      label: t.contextMenu.copyUrl,
      icon: <IconCopy size={13} />,
      onClick: () => {
        if (bm.url) navigator.clipboard.writeText(bm.url);
      },
    },
  ];

  const buildFolderMenuItems = (f: BookmarkNode): ContextMenuItem[] => {
    const childUrls = (f.children || [])
      .filter((c) => c.url)
      .map((c) => c.url!);
    const isRoot = f.parentId === "0";

    return [
      {
        label: t.contextMenu.openAll,
        icon: <IconExternal size={13} />,
        disabled: childUrls.length === 0,
        onClick: () => childUrls.forEach((url) => chrome.tabs.create({ url })),
      },
      { type: "separator" },
      {
        label: t.contextMenu.rename,
        icon: <IconEdit size={13} />,
        disabled: isRoot,
        onClick: () => setEditTarget(f),
      },
      {
        label: t.contextMenu.newFolder,
        icon: <IconFolder size={13} />,
        onClick: () => createFolder(f.id, t.contextMenu.newFolder),
      },
      { type: "separator" },
      {
        label: t.contextMenu.deleteFolder,
        icon: <IconClose size={13} />,
        danger: true,
        disabled: isRoot,
        onClick: () => setDeleteFolder(f),
      },
    ];
  };

  const handleBookmarkCtx = (e: React.MouseEvent, bm: BookmarkNode) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, bookmark: bm });
  };

  const handleFolderCtx = (e: React.MouseEvent, f: BookmarkNode) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, folder: f });
  };

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
    <DndContext
      sensors={sensors}
      collisionDetection={customCollision}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
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
            onContextMenu={handleFolderCtx}
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

          <SortableContext
            items={filtered.map((b) => bmDndId(b.id))}
            strategy={verticalListSortingStrategy}
          >
            <div className={`tm-bm-list${activeDrag ? " receiving" : ""}`}>
              {filtered.map((b) => (
                <SortableBookmarkRow
                  key={b.id}
                  bookmark={b}
                  query={q}
                  onContextMenu={(e) => handleBookmarkCtx(e, b)}
                />
              ))}
            </div>
          </SortableContext>

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

      <DragOverlay dropAnimation={dropAnimConfig}>
        {activeDrag ? (
          <DragOverlayContent type={activeDrag.type} node={activeDrag.node} />
        ) : null}
      </DragOverlay>

      {ctxMenu && ctxMenu.bookmark && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={buildBookmarkMenuItems(ctxMenu.bookmark)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {ctxMenu && ctxMenu.folder && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={buildFolderMenuItems(ctxMenu.folder)}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {editTarget && (
        <EditBookmarkDialog
          bookmark={editTarget}
          t={t}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteFolder && (
        <ConfirmDialog
          title={`${t.contextMenu.deleteFolder}?`}
          message={`"${deleteFolder.title}" and all its contents will be permanently removed.`}
          confirmLabel={t.contextMenu.deleteFolder}
          onConfirm={() => {
            removeTree(deleteFolder.id);
            if (currentFolder === deleteFolder.id) setCurrentFolder("all");
            setDeleteFolder(null);
          }}
          onCancel={() => setDeleteFolder(null)}
          danger
        />
      )}
    </DndContext>
  );
}
