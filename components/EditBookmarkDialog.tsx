import { useState, useEffect, useRef } from "react";
import { useBookmarkStore } from "../stores/bookmarkStore";
import type { BookmarkNode } from "../types";
import type { Translations } from "../utils/i18n";

interface EditBookmarkDialogProps {
  bookmark: BookmarkNode;
  t: Translations;
  onClose: () => void;
}

export function EditBookmarkDialog({
  bookmark,
  t,
  onClose,
}: EditBookmarkDialogProps) {
  const [title, setTitle] = useState(bookmark.title);
  const [url, setUrl] = useState(bookmark.url ?? "");
  const nameRef = useRef<HTMLInputElement>(null);
  const updateBookmark = useBookmarkStore((s) => s.updateBookmark);
  const isFolder = !bookmark.url;

  useEffect(() => {
    nameRef.current?.focus();
    nameRef.current?.select();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSave = async () => {
    const changes: { title?: string; url?: string } = {};
    if (title !== bookmark.title) changes.title = title;
    if (!isFolder && url !== bookmark.url) changes.url = url;
    if (Object.keys(changes).length > 0) {
      await updateBookmark(bookmark.id, changes);
    }
    onClose();
  };

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div
        className="tm-confirm"
        onClick={(e) => e.stopPropagation()}
        style={{ marginTop: "20vh", textAlign: "left", minWidth: 340 }}
      >
        <h4>{t.editDialog.editTitle}</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, margin: "16px 0 20px" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--fg-2)" }}>
              {t.editDialog.name}
            </span>
            <input
              ref={nameRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
              }}
              style={{
                padding: "6px 10px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-sub)",
                color: "var(--fg)",
                fontSize: 13,
                outline: "none",
              }}
            />
          </label>
          {!isFolder && (
            <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 11.5, fontWeight: 500, color: "var(--fg-2)" }}>
                {t.editDialog.url}
              </span>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                }}
                style={{
                  padding: "6px 10px",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  background: "var(--bg-sub)",
                  color: "var(--fg)",
                  fontSize: 13,
                  fontFamily: "var(--font-mono)",
                  outline: "none",
                }}
              />
            </label>
          )}
        </div>
        <div className="actions" style={{ justifyContent: "flex-end" }}>
          <button className="tm-btn" onClick={onClose}>
            {t.editDialog.cancel}
          </button>
          <button className="tm-btn primary" onClick={handleSave}>
            {t.editDialog.save}
          </button>
        </div>
      </div>
    </div>
  );
}
