import { useCallback, useEffect } from "react";
import { Favicon } from "./Favicon";
import { IconClose } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useHealthStore } from "../stores/healthStore";
import { findDuplicates } from "../utils/healthAnalysis";
import type { Translations } from "../utils/i18n";

interface DuplicateBookmarksHealthViewProps {
  t: Translations;
}

export function DuplicateBookmarksHealthView({ t }: DuplicateBookmarksHealthViewProps) {
  const tree = useBookmarkStore((s) => s.tree);
  const initialized = useBookmarkStore((s) => s.initialized);
  const duplicates = useHealthStore((s) => s.duplicates);

  useEffect(() => {
    if (!initialized) {
      useBookmarkStore.getState().init();
    }
  }, [initialized]);

  const runDuplicateCheck = useCallback(() => {
    useHealthStore.getState().setDuplicates(findDuplicates(tree));
  }, [tree]);

  const removeDuplicate = useCallback(async (groupUrl: string, id: string) => {
    await chrome.bookmarks.remove(id);
    useHealthStore.getState().removeDuplicate(groupUrl, id);
  }, []);

  return (
    <div className="tm-content" style={{ maxWidth: 800, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {t.health.duplicatesTitle}
        </h2>
        <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--fg-3)" }}>
          {t.health.duplicatesSubtitle}
        </p>
        <button className="tm-btn primary" onClick={runDuplicateCheck}>
          {t.health.startDuplicates}
        </button>
      </div>

      <div className="tm-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {duplicates.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)" }}>
            {t.health.noDuplicates}
          </div>
        )}
        {duplicates.map((g) => (
          <div key={g.url} style={{ padding: "12px 8px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Favicon url={g.url} size={14} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>
                {g.title}
              </span>
              <span className="tm-pill dup">{g.bookmarkIds.length}x</span>
            </div>
            <div style={{ marginLeft: 22 }}>
              {g.bookmarkIds.map((id, i) => (
                <div key={id} style={{ padding: "4px 0" }}>
                  {g.folderPaths[i] && (
                    <div style={{ fontSize: 10.5, color: "var(--fg-3)", opacity: 0.7, marginBottom: 1 }}>
                      {g.folderPaths[i]}
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span title={g.paths[i]} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)", wordBreak: "break-all" }}>
                      {g.paths[i]}
                    </span>
                    <button className="tm-btn ghost sm danger" style={{ flexShrink: 0 }} onClick={() => removeDuplicate(g.url, id)}>
                      <IconClose size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
