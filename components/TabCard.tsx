import { memo, useState, useRef } from "react";
import { Favicon } from "./Favicon";
import { IconClose, IconBookmark } from "./icons";
import { highlight } from "../utils/search";
import type { Tab } from "../types";

interface TabCardProps {
  tab: Tab;
  density: string;
  layout: string;
  isDuplicate: boolean;
  query: string;
  onClose: (tabId: number) => void;
  onOpen: (tab: Tab) => void;
  onReadLater?: (tab: Tab) => void;
}

export const TabCard = memo(function TabCard({
  tab,
  density,
  layout,
  isDuplicate,
  query,
  onClose,
  onOpen,
  onReadLater,
}: TabCardProps) {
  const [closing, setClosing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClose = (tabId: number) => {
    setClosing(true);
    cardRef.current?.addEventListener(
      "animationend",
      () => onClose(tabId),
      { once: true },
    );
  };

  const cls = [
    "tm-tab-card",
    density,
    tab.discarded ? "hibernated" : "",
    layout === "list" ? "list" : "",
    closing ? "closing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={cardRef} className={cls} onClick={() => onOpen(tab)}>
      <Favicon url={tab.url} size={16} />
      <span className="tm-tab-title">
        {highlight(tab.title, query)}
      </span>
      <span className="tm-tab-meta">
        {tab.url ? new URL(tab.url).hostname.replace(/^www\./, "") : ""}
      </span>
      {tab.discarded && <span className="tm-pill hib">Zzz</span>}
      {isDuplicate && <span className="tm-pill dup">dup</span>}
      {onReadLater && (
        <button
          className="tm-tab-close"
          onClick={(e) => {
            e.stopPropagation();
            onReadLater(tab);
          }}
          aria-label="Read Later"
        >
          <IconBookmark size={11} />
        </button>
      )}
      <button
        className="tm-tab-close"
        onClick={(e) => {
          e.stopPropagation();
          handleClose(tab.id);
        }}
        aria-label="Close tab"
      >
        <IconClose size={11} />
      </button>
    </div>
  );
});
