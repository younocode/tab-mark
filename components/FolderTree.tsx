import { DroppableFolder } from "./DroppableFolder";
import type { BookmarkNode } from "../types";

interface FolderTreeProps {
  tree: BookmarkNode[];
  current: string;
  onSelect: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, folder: BookmarkNode) => void;
  depth?: number;
}

export function FolderTree({
  tree,
  current,
  onSelect,
  onContextMenu,
  depth = 0,
}: FolderTreeProps) {
  return (
    <>
      {tree.map((node) => {
        if (node.url) return null;
        if (!node.children) return null;
        const bookmarkCount = node.children.filter((c) => c.url).length;
        return (
          <div key={node.id}>
            <DroppableFolder
              node={node}
              active={current === node.id}
              depth={depth}
              bookmarkCount={bookmarkCount}
              onClick={() => onSelect(node.id)}
              onContextMenu={(e) => onContextMenu?.(e, node)}
            />
            <FolderTree
              tree={node.children}
              current={current}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
              depth={depth + 1}
            />
          </div>
        );
      })}
    </>
  );
}
