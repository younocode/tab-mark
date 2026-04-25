import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookmarkRow } from "./BookmarkRow";
import type { BookmarkNode } from "../types";

interface SortableBookmarkRowProps {
  bookmark: BookmarkNode;
  query: string;
  selected: boolean;
  onToggleSelect: () => void;
}

export function SortableBookmarkRow({
  bookmark,
  ...rest
}: SortableBookmarkRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookmark.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BookmarkRow bookmark={bookmark} {...rest} />
    </div>
  );
}
