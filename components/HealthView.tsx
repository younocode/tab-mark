import { useState, useCallback, useEffect } from "react";
import { Favicon } from "./Favicon";
import { ConfirmDialog } from "./ConfirmDialog";
import { IconClose } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { flattenBookmarks, buildParentPathLookup } from "../utils/bookmarks";
import type { Translations } from "../utils/i18n";
import type { HealthResult, DuplicateGroup } from "../types";

interface HealthViewProps {
  t: Translations;
}

function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.delete("utm_source");
    u.searchParams.delete("utm_medium");
    u.searchParams.delete("utm_campaign");
    u.searchParams.delete("utm_content");
    u.searchParams.delete("utm_term");
    let path = u.pathname;
    if (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
    return `${u.origin}${path}${u.search}`;
  } catch {
    return url;
  }
}

export function HealthView({ t }: HealthViewProps) {
  const tree = useBookmarkStore((s) => s.tree);
  const initialized = useBookmarkStore((s) => s.initialized);
  const [tab, setTab] = useState<"dead" | "duplicates">("dead");
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ checked: 0, total: 0 });
  const [deadLinks, setDeadLinks] = useState<HealthResult[]>([]);
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([]);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Lazy-init bookmarks for health check
  if (!initialized) {
    useBookmarkStore.getState().init();
  }

  useEffect(() => {
    const listener = (message: { type: string; checked: number; total: number }) => {
      if (message.type === "HEALTH_PROGRESS") {
        setProgress({ checked: message.checked, total: message.total });
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const findDuplicates = useCallback(() => {
    const all = flattenBookmarks(tree);
    const getPath = buildParentPathLookup(tree);
    const urlMap = new Map<string, { id: string; title: string; url: string }[]>();
    for (const bm of all) {
      if (!bm.url) continue;
      const norm = normalizeUrl(bm.url);
      if (!urlMap.has(norm)) urlMap.set(norm, []);
      urlMap.get(norm)!.push({ id: bm.id, title: bm.title, url: bm.url });
    }
    const dups: DuplicateGroup[] = [];
    for (const [url, items] of urlMap) {
      if (items.length > 1) {
        dups.push({
          url,
          title: items[0].title,
          bookmarkIds: items.map((i) => i.id),
          paths: items.map((i) => i.url),
          folderPaths: items.map((i) => getPath(i.id)),
        });
      }
    }
    setDuplicates(dups);
  }, [tree]);

  const startScan = useCallback(async () => {
    const all = flattenBookmarks(tree).filter((b) => b.url);
    setScanning(true);
    setDeadLinks([]);
    setProgress({ checked: 0, total: all.length });

    findDuplicates();

    const urls = all.map((bm) => ({
      bookmarkId: bm.id,
      url: bm.url!,
      title: bm.title,
    }));

    const results: HealthResult[] = await chrome.runtime.sendMessage({
      type: "HEALTH_CHECK",
      urls,
    });

    setDeadLinks(
      results.map((r) => ({ ...r, parentPath: "" })),
    );
    setProgress({ checked: all.length, total: all.length });
    setScanning(false);
  }, [tree, findDuplicates]);

  const removeBookmark = useCallback(async (id: string) => {
    await chrome.bookmarks.remove(id);
    setDeadLinks((prev) => prev.filter((d) => d.bookmarkId !== id));
  }, []);

  const removeDuplicate = useCallback(async (groupUrl: string, id: string) => {
    await chrome.bookmarks.remove(id);
    setDuplicates((prev) =>
      prev
        .map((g) => {
          if (g.url !== groupUrl) return g;
          const idx = g.bookmarkIds.indexOf(id);
          if (idx === -1) return g;
          return {
            ...g,
            bookmarkIds: g.bookmarkIds.filter((_, i) => i !== idx),
            paths: g.paths.filter((_, i) => i !== idx),
            folderPaths: g.folderPaths.filter((_, i) => i !== idx),
          };
        })
        .filter((g) => g.bookmarkIds.length > 1),
    );
  }, []);

  const removeAllDead = useCallback(async () => {
    for (const d of deadLinks) {
      await chrome.bookmarks.remove(d.bookmarkId);
    }
    setDeadLinks([]);
  }, [deadLinks]);

  const progressPct =
    progress.total > 0
      ? Math.round((progress.checked / progress.total) * 100)
      : 0;

  return (
    <div className="tm-content" style={{ maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
          {t.health.title}
        </h2>
        <p
          style={{
            margin: "4px 0 16px",
            fontSize: 13,
            color: "var(--fg-3)",
          }}
        >
          {t.health.subtitle}
        </p>
        <button
          className={`tm-btn primary ${scanning ? "loading" : ""}`}
          onClick={startScan}
          disabled={scanning}
        >
          {scanning ? t.health.scanning : t.health.start}
        </button>
        {scanning && (
          <div style={{ marginTop: 12 }}>
            <div
              style={{
                fontSize: 11.5,
                color: "var(--fg-3)",
                fontFamily: "var(--font-mono)",
                marginBottom: 4,
              }}
            >
              {t.health.checked(progress.checked, progress.total)}
            </div>
            <div
              style={{
                height: 4,
                background: "var(--bg-active)",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "var(--accent)",
                  transition: "width 0.3s",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="tm-segmented" style={{ marginBottom: 16 }}>
        <button
          className={tab === "dead" ? "active" : ""}
          onClick={() => setTab("dead")}
        >
          {t.health.dead} ({deadLinks.length})
        </button>
        <button
          className={tab === "duplicates" ? "active" : ""}
          onClick={() => setTab("duplicates")}
        >
          {t.health.duplicates} ({duplicates.length})
        </button>
      </div>

      {tab === "dead" && (
        <div>
          {deadLinks.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <button className="tm-btn danger sm" onClick={() => setShowDeleteAllConfirm(true)}>
                {t.health.deleteAll}
              </button>
            </div>
          )}
          {deadLinks.length === 0 && !scanning && (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--fg-3)",
              }}
            >
              {t.health.noDead}
            </div>
          )}
          {deadLinks.map((d) => (
            <div
              key={d.bookmarkId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 8px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <Favicon url={d.url} size={14} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    textDecoration: "line-through",
                    opacity: 0.6,
                  }}
                >
                  {d.title}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--fg-3)",
                  }}
                >
                  {d.url}
                </div>
              </div>
              <span
                className="tm-pill"
                style={{
                  background: "oklch(from var(--danger) l c h / 0.15)",
                  color: "var(--danger)",
                }}
              >
                {typeof d.status === "number" ? d.status : d.status}
              </span>
              <button
                className="tm-btn ghost sm danger"
                onClick={() => removeBookmark(d.bookmarkId)}
              >
                <IconClose size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tab === "duplicates" && (
        <div>
          {duplicates.length === 0 && !scanning && (
            <div
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--fg-3)",
              }}
            >
              {t.health.noDuplicates}
            </div>
          )}
          {duplicates.map((g) => (
            <div
              key={g.url}
              style={{
                padding: "12px 8px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <Favicon url={g.url} size={14} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>
                  {g.title}
                </span>
                <span className="tm-pill dup">
                  {g.bookmarkIds.length}x
                </span>
              </div>
              <div style={{ marginLeft: 22 }}>
                {g.bookmarkIds.map((id, i) => (
                  <div
                    key={id}
                    style={{ padding: "4px 0" }}
                  >
                    {g.folderPaths[i] && (
                      <div
                        style={{
                          fontSize: 10.5,
                          color: "var(--fg-3)",
                          opacity: 0.7,
                          marginBottom: 1,
                        }}
                      >
                        {g.folderPaths[i]}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--fg-3)",
                          wordBreak: "break-all",
                        }}
                      >
                        {g.paths[i]}
                      </span>
                      {i > 0 && (
                        <button
                          className="tm-btn ghost sm danger"
                          style={{ flexShrink: 0 }}
                          onClick={() => removeDuplicate(g.url, id)}
                        >
                          {t.health.remove}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteAllConfirm && (
        <ConfirmDialog
          title={`Delete ${deadLinks.length} dead links?`}
          message="These bookmarks point to pages that no longer exist. They will be permanently removed."
          confirmLabel={t.health.deleteAll}
          onConfirm={() => {
            removeAllDead();
            setShowDeleteAllConfirm(false);
          }}
          onCancel={() => setShowDeleteAllConfirm(false)}
          danger
        />
      )}
    </div>
  );
}
