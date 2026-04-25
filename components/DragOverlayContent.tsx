import { Favicon } from "./Favicon";
import { IconFolder } from "./icons";
import { getDomain } from "../utils/search";
import type { BookmarkNode } from "../types";

interface DragOverlayContentProps {
  type: "bookmark" | "folder";
  node: BookmarkNode;
}

export function DragOverlayContent({ type, node }: DragOverlayContentProps) {
  if (type === "folder") {
    const count = (node.children || []).filter((c) => c.url).length;
    return (
      <div className="tm-drag-overlay" style={{ maxWidth: 240 }}>
        <IconFolder size={14} style={{ flexShrink: 0 }} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 500,
            }}
          >
            {node.title}
          </div>
          <div
            style={{
              fontSize: 10.5,
              color: "var(--fg-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {count} bookmark{count === 1 ? "" : "s"}
          </div>
        </div>
      </div>
    );
  }

  const domain = node.url ? getDomain(node.url) : "";

  return (
    <div className="tm-drag-overlay">
      <div style={{ flexShrink: 0 }}>
        <Favicon url={node.url} size={14} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontWeight: 500,
          }}
        >
          {node.title}
        </div>
        {domain && (
          <div
            style={{
              fontSize: 10.5,
              color: "var(--fg-3)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {domain}
          </div>
        )}
      </div>
    </div>
  );
}
