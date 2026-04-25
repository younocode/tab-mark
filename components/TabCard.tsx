import { memo } from "react";
import { Favicon } from "./Favicon";
import { IconClose } from "./icons";
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
}

export const TabCard = memo(function TabCard({
  tab,
  density,
  layout,
  isDuplicate,
  query,
  onClose,
  onOpen,
}: TabCardProps) {
  const cls = [
    "tm-tab-card",
    density,
    tab.discarded ? "hibernated" : "",
    layout === "list" ? "list" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} onClick={() => onOpen(tab)}>
      <Favicon url={tab.url} size={16} />
      <span className="tm-tab-title">
        {highlight(tab.title, query)}
      </span>
      <span className="tm-tab-meta">
        {tab.url ? new URL(tab.url).hostname.replace(/^www\./, "") : ""}
      </span>
      {tab.discarded && <span className="tm-pill hib">Zzz</span>}
      {isDuplicate && <span className="tm-pill dup">dup</span>}
      <button
        className="tm-tab-close"
        onClick={(e) => {
          e.stopPropagation();
          onClose(tab.id);
        }}
        aria-label="Close tab"
      >
        <IconClose size={11} />
      </button>
    </div>
  );
});
