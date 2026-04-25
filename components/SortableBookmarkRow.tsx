import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookmarkRow } from "./BookmarkRow";
import { bmDndId } from "../utils/dndIds";
import type { BookmarkNode } from "../types";

interface SortableBookmarkRowProps {
  bookmark: BookmarkNode;
  query: string;
  onContextMenu: (e: React.MouseEvent) => void;
}

export function SortableBookmarkRow({
  bookmark,
  query,
  onContextMenu,
}: SortableBookmarkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isSorting,
    isOver,
    activeIndex,
    index,
  } = useSortable({
    id: bmDndId(bookmark.id),
    data: { type: "bookmark", node: bookmark },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : undefined,
  };

  let cls = "tm-bm-sortable";
  if (isOver && isSorting && !isDragging) {
    cls += activeIndex > index ? " insert-before" : " insert-after";
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cls}
      {...attributes}
      {...listeners}
      onContextMenu={onContextMenu}
    >
      <BookmarkRow bookmark={bookmark} query={query} />
    </div>
  );
}
