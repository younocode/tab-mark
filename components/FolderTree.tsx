import { IconFolder } from "./icons";
import type { BookmarkNode } from "../types";

interface FolderTreeProps {
  tree: BookmarkNode[];
  current: string;
  onSelect: (id: string) => void;
  depth?: number;
}

export function FolderTree({
  tree,
  current,
  onSelect,
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
            <button
              className={`tm-bm-folder ${current === node.id ? "active" : ""}`}
              style={{ paddingLeft: 8 + depth * 14 }}
              onClick={() => onSelect(node.id)}
            >
              <IconFolder size={12} />
              <span>{node.title}</span>
              {bookmarkCount > 0 && (
                <span className="count">{bookmarkCount}</span>
              )}
            </button>
            <FolderTree
              tree={node.children}
              current={current}
              onSelect={onSelect}
              depth={depth + 1}
            />
          </div>
        );
      })}
    </>
  );
}
