import { useCallback, useEffect, useMemo, useState } from "react";
import { Favicon } from "./Favicon";
import { ConfirmDialog } from "./ConfirmDialog";
import { IconClose, IconPause, IconPlay, IconTrash } from "./icons";
import { useBookmarkStore } from "../stores/bookmarkStore";
import { useHealthStore } from "../stores/healthStore";
import { buildParentPathLookup, flattenBookmarks } from "../utils/bookmarks";
import type { Translations } from "../utils/i18n";

interface DeadLinksHealthViewProps {
  t: Translations;
}

export function DeadLinksHealthView({ t }: DeadLinksHealthViewProps) {
  const tree = useBookmarkStore((s) => s.tree);
  const initialized = useBookmarkStore((s) => s.initialized);
  const scanning = useHealthStore((s) => s.scanning);
  const paused = useHealthStore((s) => s.paused);
  const progress = useHealthStore((s) => s.progress);
  const deadLinks = useHealthStore((s) => s.deadLinks);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [deleteStatusConfirm, setDeleteStatusConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) {
      useBookmarkStore.getState().init();
    }
  }, [initialized]);

  const parentPathLookup = useMemo(() => buildParentPathLookup(tree), [tree]);

  const severityCounts = useMemo(() => {
    let dead = 0;
    let warn = 0;
    for (const d of deadLinks) {
      if (d.severity === "warn") warn += 1;
      else dead += 1;
    }
    return { dead, warn };
  }, [deadLinks]);

  const statusGroups = useMemo(() => {
    const map = new Map<string, number>();
    const source =
      statusFilter === "severity:dead"
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
    if (statusFilter === "severity:dead") {
      return deadLinks.filter((d) => d.severity === "dead");
    }
    if (statusFilter === "severity:warn") {
      return deadLinks.filter((d) => d.severity === "warn");
    }
    if (statusFilter) {
      return deadLinks.filter((d) => String(d.status) === statusFilter);
    }
    return deadLinks;
  }, [deadLinks, statusFilter]);

  const startScan = useCallback(async () => {
    const store = useHealthStore.getState();
    const all = flattenBookmarks(tree).filter((b) => b.url);
    store.setScanning(true);
    store.setPaused(false);
    store.setDeadLinks([]);
    store.setProgress({ checked: 0, total: all.length });

    await chrome.runtime.sendMessage({
      type: "HEALTH_CHECK",
      urls: all.map((bm) => ({
        bookmarkId: bm.id,
        url: bm.url!,
        title: bm.title,
      })),
    });

    store.setProgress({ checked: all.length, total: all.length });
    store.setScanning(false);
    store.setPaused(false);
  }, [tree]);

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

  const removeAllDead = useCallback(async () => {
    for (const d of deadLinks) {
      await chrome.bookmarks.remove(d.bookmarkId);
    }
    useHealthStore.getState().removeAllDead();
    setStatusFilter(null);
  }, [deadLinks]);

  const removeByFilter = useCallback(
    async (filter: string) => {
      const toRemove =
        filter === "severity:dead"
          ? deadLinks.filter((d) => d.severity === "dead")
          : filter === "severity:warn"
            ? deadLinks.filter((d) => d.severity === "warn")
            : deadLinks.filter((d) => String(d.status) === filter);

      for (const d of toRemove) {
        await chrome.bookmarks.remove(d.bookmarkId);
      }

      const removeIds = new Set(toRemove.map((d) => d.bookmarkId));
      const store = useHealthStore.getState();
      store.setDeadLinks(store.deadLinks.filter((d) => !removeIds.has(d.bookmarkId)));
      if (statusFilter === filter) setStatusFilter(null);
    },
    [deadLinks, statusFilter],
  );

  const progressPct =
    progress.total > 0 ? Math.round((progress.checked / progress.total) * 100) : 0;

  return (
    <div className="tm-content" style={{ maxWidth: 800, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ flexShrink: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
            {t.health.deadTitle}
          </h2>
          <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--fg-3)" }}>
            {t.health.deadSubtitle}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              className={`tm-btn primary ${scanning && !paused ? "loading" : ""}`}
              onClick={startScan}
              disabled={scanning}
            >
              {scanning ? t.health.scanning : t.health.startDead}
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
                <button className="tm-btn ghost icon" onClick={cancelScan} title={t.health.cancel}>
                  <IconClose size={13} />
                </button>
              </>
            )}
          </div>
          {scanning && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)", fontFamily: "var(--font-mono)", marginBottom: 4 }}>
                {t.health.checked(progress.checked, progress.total)}
                {paused && ` - ${t.health.pause}`}
              </div>
              <div style={{ height: 4, background: "var(--bg-active)", borderRadius: 999, overflow: "hidden" }}>
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

        {deadLinks.length > 0 && (
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
                onClick={() => (statusFilter ? setDeleteStatusConfirm(statusFilter) : setShowDeleteAllConfirm(true))}
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

      <div className="tm-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {deadLinks.length === 0 && !scanning && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--fg-3)" }}>
            {t.health.noDead}
          </div>
        )}
        {filteredDeadLinks.map((d) => (
          <div
            key={d.bookmarkId}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 8px", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
            onClick={() => window.open(d.url, "_blank", "noopener")}
          >
            <Favicon url={d.url} size={14} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 500, textDecoration: d.severity === "dead" ? "line-through" : "none", opacity: d.severity === "dead" ? 0.6 : 0.85 }}>
                {d.title}
              </div>
              <div title={d.url} style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--fg-3)" }}>
                {d.url}
              </div>
              {d.finalUrl && (
                <div title={d.finalUrl} style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--accent)", marginTop: 2 }}>
                  {`-> ${d.finalUrl}`}
                </div>
              )}
              {parentPathLookup(d.bookmarkId) && (
                <div style={{ fontSize: 10.5, color: "var(--fg-4)", marginTop: 2 }}>
                  {parentPathLookup(d.bookmarkId)}
                </div>
              )}
            </div>
            <span
              className="tm-pill"
              style={{
                background: d.severity === "warn" ? "oklch(from var(--accent) l c h / 0.15)" : "oklch(from var(--danger) l c h / 0.15)",
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
