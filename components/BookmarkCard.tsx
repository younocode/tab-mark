import { memo } from "react";
import { Favicon } from "./Favicon";
import { highlight, getDomain } from "../utils/search";
import type { BookmarkNode } from "../types";

interface BookmarkCardProps {
  bookmark: BookmarkNode;
  query: string;
}

export const BookmarkCard = memo(function BookmarkCard({
  bookmark,
  query,
}: BookmarkCardProps) {
  const domain = bookmark.url ? getDomain(bookmark.url) : "";

  return (
    <div
      className="tm-bm-card"
      onClick={() => {
        if (bookmark.url) chrome.tabs.create({ url: bookmark.url });
      }}
      style={{ cursor: "pointer" }}
    >
      <div className="top">
        <Favicon url={bookmark.url} size={16} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fg-3)",
          }}
        >
          {domain}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            color: "var(--fg-4)",
          }}
        >
          {bookmark.dateAdded
            ? new Date(bookmark.dateAdded).toLocaleDateString()
            : ""}
        </span>
      </div>
      <div className="b-title">
        {highlight(bookmark.title, query)}
      </div>
    </div>
  );
});
