import { useState, useCallback, useMemo } from "react";
import { Favicon } from "./Favicon";
import { ConfirmDialog } from "./ConfirmDialog";
import { IconClose, IconTrash, IconPause, IconPlay, IconFolder } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useHealthStore } from "../stores/healthStore";
import type { EmptyFolder } from "../stores/healthStore";
import { flattenBookmarks, buildParentPathLookup } from "../utils/bookmarks";
import type { Translations } from "../utils/i18n";
import type { DuplicateGroup } from "../types";

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

function findEmptyFolders(tree: chrome.bookmarks.BookmarkTreeNode[]): EmptyFolder[] {
  const results: EmptyFolder[] = [];
  function walk(nodes: chrome.bookmarks.BookmarkTreeNode[], path: string) {
    for (const n of nodes) {
      if (n.url) continue;
      const currentPath = path ? `${path} › ${n.title}` : n.title;
      if (n.children && n.children.length === 0) {
        results.push({ id: n.id, title: n.title, path: currentPath });
      }
      if (n.children) walk(n.children, currentPath);
    }
  }
  walk(tree, "");
  return results;
}

export function HealthView({ t }: HealthViewProps) {
  const tree = useBookmarkStore((s) => s.tree);
  const initialized = useBookmarkStore((s) => s.initialized);

  const tab = useHealthStore((s) => s.tab);
  const scanning = useHealthStore((s) => s.scanning);
  const paused = useHealthStore((s) => s.paused);
  const progress = useHealthStore((s) => s.progress);
  const deadLinks = useHealthStore((s) => s.deadLinks);
  const duplicates = useHealthStore((s) => s.duplicates);
  const emptyFolders = useHealthStore((s) => s.emptyFolders);
  const setTab = useHealthStore((s) => s.setTab);

  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [deleteStatusConfirm, setDeleteStatusConfirm] = useState<string | null>(null);

  const severityCounts = useMemo(() => {
    let dead = 0, warn = 0;
    for (const d of deadLinks) {
      if (d.severity === "warn") warn++; else dead++;
    }
    return { dead, warn };
  }, [deadLinks]);

  const statusGroups = useMemo(() => {
    const map = new Map<string, number>();
    const source = statusFilter === "severity:dead"
      ? deadLinks.filter((d) => d.severity === "dead")
      : statusFilter === "severity:warn"
        ? deadLinks.filter((d) => d.severity === "warn")
        : deadLinks;
    for (const d of source) {
      const key = String(d.status);
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [deadLinks, statusFilter]);

  const filteredDeadLinks = useMemo(() => {
    let list = deadLinks;
    if (statusFilter === "severity:dead") list = list.filter((d) => d.severity === "dead");
    else if (statusFilter === "severity:warn") list = list.filter((d) => d.severity === "warn");
    else if (statusFilter && !statusFilter.startsWith("severity:")) list = list.filter((d) => String(d.status) === statusFilter);
    return list;
  }, [deadLinks, statusFilter]);

  if (!initialized) {
    useBookmarkStore.getState().init();
  }

  const parentPathLookup = useMemo(() => buildParentPathLookup(tree), [tree]);

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
    useHealthStore.getState().setDuplicates(dups);
  }, [tree]);

  const startScan = useCallback(async () => {
    const store = useHealthStore.getState();
    const all = flattenBookmarks(tree).filter((b) => b.url);
    store.setScanning(true);
    store.setPaused(false);
    store.setDeadLinks([]);
    store.setProgress({ checked: 0, total: all.length });

    findDuplicates();
    store.setEmptyFolders(findEmptyFolders(tree));

    const urls = all.map((bm) => ({
      bookmarkId: bm.id,
      url: bm.url!,
      title: bm.title,
    }));

    await chrome.runtime.sendMessage({
      type: "HEALTH_CHECK",
      urls,
    });

    store.setProgress({ checked: all.length, total: all.length });
    store.setScanning(false);
    store.setPaused(false);
  }, [tree, findDuplicates]);

  const togglePause = useCallback(() => {
    const next = !paused;
    useHealthStore.getState().setPaused(next);
    chrome.runtime.sendMessage({ type: next ? "HEALTH_PAUSE" : "HEALTH_RESUME" });
  }, [paused]);

  const cancelScan = useCallback(() => {
    chrome.runtime.sendMessage({ type: "HEALTH_CANCEL" });
    useHealthStore.getState().setScanning(false);
    useHealthStore.getState().setPaused(false);
  }, []);

  const removeBookmark = useCallback(async (id: string) => {
    await chrome.bookmarks.remove(id);
    useHealthStore.getState().removeDeadLink(id);
  }, []);

  const removeDuplicate = useCallback(async (groupUrl: string, id: string) => {
    await chrome.bookmarks.remove(id);
    useHealthStore.getState().removeDuplicate(groupUrl, id);
  }, []);

  const removeAllDead = useCallback(async () => {
    for (const d of deadLinks) {
      await chrome.bookmarks.remove(d.bookmarkId);
    }
    useHealthStore.getState().removeAllDead();
    setStatusFilter(null);
  }, [deadLinks]);

  const removeByFilter = useCallback(async (filter: string) => {
    let toRemove;
    if (filter === "severity:dead") {
      toRemove = deadLinks.filter((d) => d.severity === "dead");
    } else if (filter === "severity:warn") {
      toRemove = deadLinks.filter((d) => d.severity === "warn");
    } else {
      toRemove = deadLinks.filter((d) => String(d.status) === filter);
    }
    for (const d of toRemove) {
      await chrome.bookmarks.remove(d.bookmarkId);
    }
    const store = useHealthStore.getState();
    store.setDeadLinks(store.deadLinks.filter((d) => !toRemove.some((r) => r.bookmarkId === d.bookmarkId)));
    if (statusFilter === filter) setStatusFilter(null);
  }, [deadLinks, statusFilter]);

  const removeEmptyFolder = useCallback(async (id: string) => {
    await chrome.bookmarks.removeTree(id);
    useHealthStore.getState().removeEmptyFolder(id);
  }, []);

  const progressPct =
    progress.total > 0
      ? Math.round((progress.checked / progress.total) * 100)
      : 0;

  return (
    <div className="tm-content" style={{ maxWidth: 800, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Fixed header */}
      <div style={{ flexShrink: 0 }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className={`tm-btn primary ${scanning && !paused ? "loading" : ""}`}
              onClick={startScan}
              disabled={scanning}
            >
              {scanning ? t.health.scanning : t.health.start}
            </button>
            {scanning && (
              <>
                <button
                  className="tm-btn ghost icon"
                  onClick={togglePause}
                  title={paused ? t.health.resume : t.health.pause}
                >
                  {paused ? <IconPlay size={13} /> : <IconPause size={13} />}
                </button>
                <button
                  className="tm-btn ghost icon"
                  onClick={cancelScan}
                  title={t.health.cancel}
                >
                  <IconClose size={13} />
                </button>
              </>
            )}
          </div>
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
                {paused && ` — ${t.health.pause}`}
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
                    background: paused ? "var(--fg-4)" : "var(--accent)",
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
          <button
            className={tab === "empty" ? "active" : ""}
            onClick={() => setTab("empty")}
          >
            {t.health.emptyFolders} ({emptyFolders.length})
          </button>
        </div>

        {tab === "dead" && deadLinks.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              <button
                className={`tm-btn sm ${statusFilter === null ? "primary" : "ghost"}`}
                onClick={() => setStatusFilter(null)}
              >
                {t.health.dead} ({deadLinks.length})
              </button>
              {severityCounts.dead > 0 && (
                <button
                  className={`tm-btn sm ${statusFilter === "severity:dead" ? "primary" : "ghost"}`}
                  style={statusFilter !== "severity:dead" ? { color: "var(--danger)" } : undefined}
                  onClick={() => setStatusFilter(statusFilter === "severity:dead" ? null : "severity:dead")}
                >
                  {t.health.confirmed} ({severityCounts.dead})
                </button>
              )}
              {severityCounts.warn > 0 && (
                <button
                  className={`tm-btn sm ${statusFilter === "severity:warn" ? "primary" : "ghost"}`}
                  style={statusFilter !== "severity:warn" ? { color: "var(--accent)" } : undefined}
                  onClick={() => setStatusFilter(statusFilter === "severity:warn" ? null : "severity:warn")}
                >
                  {t.health.warn} ({severityCounts.warn})
                </button>
              )}
              <button
                className="tm-btn ghost icon sm danger"
                style={{ marginLeft: "auto" }}
                onClick={() => statusFilter ? setDeleteStatusConfirm(statusFilter) : setShowDeleteAllConfirm(true)}
                title={statusFilter ? `${t.health.deleteAll} ${statusFilter}` : t.health.deleteAll}
              >
                <IconTrash size={12} />
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
              {statusGroups.map(([status, count]) => (
                <button
                  key={status}
                  className={`tm-btn sm ${statusFilter === status ? "primary" : "ghost"}`}
                  onClick={() => setStatusFilter(statusFilter === status ? null : status)}
                >
                  {t.health.statusLabels[status] || status} ({count})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable list */}
      <div className="tm-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {tab === "dead" && (
          <div>
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
            {filteredDeadLinks.map((d) => (
              <div
                key={d.bookmarkId}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 8px",
                  borderBottom: "1px solid var(--border)",
                  cursor: "pointer",
                }}
                onClick={() => window.open(d.url, "_blank", "noopener")}
              >
                <Favicon url={d.url} size={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      textDecoration: d.severity === "dead" ? "line-through" : "none",
                      opacity: d.severity === "dead" ? 0.6 : 0.85,
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
                  {d.finalUrl && (
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10.5,
                        color: "var(--accent)",
                        marginTop: 2,
                      }}
                    >
                      → {d.finalUrl}
                    </div>
                  )}
                  {parentPathLookup(d.bookmarkId) && (
                    <div
                      style={{
                        fontSize: 10.5,
                        color: "var(--fg-4)",
                        marginTop: 2,
                      }}
                    >
                      {parentPathLookup(d.bookmarkId)}
                    </div>
                  )}
                </div>
                <span
                  className="tm-pill"
                  style={{
                    background: d.severity === "warn"
                      ? "oklch(from var(--accent) l c h / 0.15)"
                      : "oklch(from var(--danger) l c h / 0.15)",
                    color: d.severity === "warn" ? "var(--accent)" : "var(--danger)",
                    flexShrink: 0,
                  }}
                >
                  {t.health.statusLabels[d.status] || d.status}
                  {d.httpStatus ? ` ${d.httpStatus}` : ""}
                </span>
                <button
                  className="tm-btn ghost icon sm danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeBookmark(d.bookmarkId);
                  }}
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
                        <button
                          className="tm-btn ghost sm danger"
                          style={{ flexShrink: 0 }}
                          onClick={() => removeDuplicate(g.url, id)}
                        >
                          <IconClose size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "empty" && (
          <div>
            {emptyFolders.length === 0 && !scanning && (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--fg-3)",
                }}
              >
                {t.health.noEmptyFolders}
              </div>
            )}
            {emptyFolders.map((f) => (
              <div
                key={f.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 8px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <IconFolder size={14} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {f.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--fg-4)",
                      marginTop: 1,
                    }}
                  >
                    {f.path}
                  </div>
                </div>
                <button
                  className="tm-btn ghost icon sm danger"
                  onClick={() => removeEmptyFolder(f.id)}
                >
                  <IconClose size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDeleteAllConfirm && (
        <ConfirmDialog
          title={t.health.deleteAllTitle(deadLinks.length)}
          message={t.health.deleteAllMessage}
          confirmLabel={t.health.deleteAll}
          onConfirm={() => {
            removeAllDead();
            setShowDeleteAllConfirm(false);
          }}
          onCancel={() => setShowDeleteAllConfirm(false)}
          danger
        />
      )}

      {deleteStatusConfirm && (
        <ConfirmDialog
          title={t.health.deleteAllTitle(filteredDeadLinks.length)}
          message={t.health.deleteAllMessage}
          confirmLabel={t.health.deleteAll}
          onConfirm={() => {
            removeByFilter(deleteStatusConfirm);
            setDeleteStatusConfirm(null);
          }}
          onCancel={() => setDeleteStatusConfirm(null)}
          danger
        />
      )}
    </div>
  );
}
