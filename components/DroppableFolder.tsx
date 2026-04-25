import { useCallback } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { IconFolder } from "./icons";
import { folderDndId } from "../utils/dndIds";
import type { BookmarkNode } from "../types";

interface DroppableFolderProps {
  node: BookmarkNode;
  active: boolean;
  depth: number;
  bookmarkCount: number;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function DroppableFolder({
  node,
  active,
  depth,
  bookmarkCount,
  onClick,
  onContextMenu,
}: DroppableFolderProps) {
  const isRoot = node.parentId === "0";
  const dndId = folderDndId(node.id);

  const {
    setNodeRef: setDroppableRef,
    isOver,
  } = useDroppable({
    id: dndId,
    data: { type: "folder", node },
  });

  const {
    setNodeRef: setDraggableRef,
    listeners,
    attributes,
    isDragging,
  } = useDraggable({
    id: dndId,
    data: { type: "folder", node },
    disabled: isRoot,
  });

  const combinedRef = useCallback(
    (el: HTMLElement | null) => {
      setDroppableRef(el);
      setDraggableRef(el);
    },
    [setDroppableRef, setDraggableRef],
  );

  const classes = [
    "tm-bm-folder",
    active ? "active" : "",
    isOver ? "drop-target" : "",
    isDragging ? "dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={combinedRef}
      className={classes}
      style={{ paddingLeft: 8 + depth * 14 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      {...attributes}
      {...listeners}
    >
      <IconFolder size={12} />
      <span>{node.title}</span>
      {bookmarkCount > 0 && <span className="count">{bookmarkCount}</span>}
    </button>
  );
}
