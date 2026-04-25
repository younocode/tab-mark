import { memo, useState, useRef } from "react";
import { Favicon } from "./Favicon";
import { IconClose, IconBookmark, IconMore } from "./icons";
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
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div style={{ position: "relative" }}>
        <button
          className="tm-tab-close"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          aria-label="More actions"
          style={{ opacity: undefined }}
        >
          <IconMore size={11} />
        </button>
        {menuOpen && (
          <>
            <div
              style={{ position: "fixed", inset: 0, zIndex: 10 }}
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(false);
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "100%",
                zIndex: 11,
                background: "var(--bg-elev)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                boxShadow: "var(--shadow-md)",
                padding: 4,
                minWidth: 140,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {onReadLater && (
                <button
                  className="tm-btn ghost sm"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                  onClick={() => {
                    onReadLater(tab);
                    setMenuOpen(false);
                  }}
                >
                  <IconBookmark size={11} /> Read Later
                </button>
              )}
              <button
                className="tm-btn ghost sm danger"
                style={{ width: "100%", justifyContent: "flex-start" }}
                onClick={() => {
                  handleClose(tab.id);
                  setMenuOpen(false);
                }}
              >
                <IconClose size={11} /> Close
              </button>
            </div>
          </>
        )}
      </div>
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
