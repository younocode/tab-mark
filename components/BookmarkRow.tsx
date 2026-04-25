import { memo } from "react";
import { Favicon } from "./Favicon";
import { highlight, getDomain } from "../utils/search";
import type { BookmarkNode } from "../types";

interface BookmarkRowProps {
  bookmark: BookmarkNode;
  query: string;
}

export const BookmarkRow = memo(function BookmarkRow({
  bookmark,
  query,
}: BookmarkRowProps) {
  const domain = bookmark.url ? getDomain(bookmark.url) : "";

  return (
    <div className="tm-bm-row">
      <Favicon url={bookmark.url} size={14} />
      <div style={{ minWidth: 0 }}>
        <div className="b-title">{highlight(bookmark.title, query)}</div>
        <div
          style={{
            display: "flex",
            gap: 6,
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <span className="b-domain">{domain}</span>
        </div>
      </div>
      <span className="b-meta">
        {bookmark.dateAdded
          ? new Date(bookmark.dateAdded).toLocaleDateString()
          : ""}
      </span>
    </div>
  );
});
