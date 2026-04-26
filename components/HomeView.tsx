import { useMemo, useCallback, useState } from "react";
import { TopSites } from "./TopSites";
import { ReadingListSection } from "./ReadingListSection";
import { TabCard } from "./TabCard";
import { GroupHeader } from "./TabGroup";
import { RecentlyClosedList } from "./RecentlyClosed";
import { ConfirmDialog } from "./ConfirmDialog";
import { useTabStore } from "../stores/tabStore";
import { useTabGroupStore } from "../stores/tabGroupStore";
import { useSessionStore } from "../stores/sessionStore";
import { useTopSitesStore } from "../stores/topSitesStore";
import { usePreferenceStore } from "../stores/preferenceStore";
import { useReadingListStore } from "../stores/readingListStore";
import { buildGroups } from "../utils/grouping";
import { matchesQuery } from "../utils/search";
import type { Translations } from "../utils/i18n";
import type { Tab } from "../types";
import type { ToastData } from "./Toast";

interface HomeViewProps {
  query: string;
  setQuery: (q: string) => void;
  t: Translations;
  showToast: (data: ToastData) => void;
}

export function HomeView({ query, setQuery, t, showToast }: HomeViewProps) {
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const tabs = useTabStore((s) => s.tabs);
  const closeTab = useTabStore((s) => s.closeTab);
  const activateTab = useTabStore((s) => s.activateTab);
  const groups = useTabGroupStore((s) => s.groups);
  const recentlyClosed = useSessionStore((s) => s.recentlyClosed);
  const restoreSession = useSessionStore((s) => s.restoreSession);
  const readingEntries = useReadingListStore((s) => s.entries);
  const allSites = useTopSitesStore((s) => s.sites);
  const topSitesStyle = usePreferenceStore((s) => s.topSitesStyle);
  const topSitesCount = usePreferenceStore((s) => s.topSitesCount);
  const sites = allSites.slice(0, topSitesCount);
  const density = usePreferenceStore((s) => s.density);
  const tabsLayout = usePreferenceStore((s) => s.tabsLayout);
  const grouping = usePreferenceStore((s) => s.grouping);
  const groupHeader = usePreferenceStore((s) => s.groupHeader);

  const q = query.trim();

  const filtered = useMemo(
    () =>
      !q
        ? tabs
        : tabs.filter((tab) => matchesQuery(q, tab.title, tab.url)),
    [tabs, q],
  );

  const displayGroups = useMemo(
    () => buildGroups(filtered, groups, grouping),
    [filtered, groups, grouping],
  );

  const allDisplayGroups = useMemo(
    () => buildGroups(tabs, groups, grouping),
    [tabs, groups, grouping],
  );

  const readingCount = useMemo(
    () => readingEntries.filter((entry) => !entry.hasBeenRead).length,
    [readingEntries],
  );

  const dupSet = useMemo(() => {
    const urlCount: Record<string, number> = {};
    tabs.forEach((tab) => {
      urlCount[tab.url] = (urlCount[tab.url] || 0) + 1;
    });
    return new Set(
      Object.keys(urlCount).filter((u) => urlCount[u] > 1),
    );
  }, [tabs]);

  const cardCols =
    tabsLayout === "list"
      ? "list"
      : density === "spacious"
        ? "cols-3"
        : "cols-4";

  const handleClose = useCallback(
    async (tabId: number) => {
      await closeTab(tabId);
      await useSessionStore.getState().refresh();
    },
    [closeTab],
  );

  const handleOpen = useCallback(
    (tab: Tab) => {
      activateTab(tab.id, tab.windowId);
    },
    [activateTab],
  );

  const handleOpenUrl = useCallback((url: string) => {
    chrome.tabs.create({ url });
  }, []);

  const handleRestore = useCallback(
    async (sessionId: string) => {
      await restoreSession(sessionId);
      showToast({ msg: "Tab restored" });
    },
    [restoreSession, showToast],
  );

  const handleReadLater = useCallback(
    async (tab: Tab) => {
      if (chrome.readingList) {
        await chrome.readingList.addEntry({
          url: tab.url,
          title: tab.title,
          hasBeenRead: false,
        });
        showToast({ msg: `Added "${tab.title.slice(0, 30)}…" to reading list` });
      }
    },
    [showToast],
  );

  const toggleGroup = useCallback((name: string) => {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  return (
    <div className="tm-content tm-home">
      <div className="tm-home-workspace">
        <div className="tm-home-main">
          <div className="tm-work-card">
            <div className="tm-section-hd">
              <h2>{t.nav.tabs}</h2>
              <span className="meta">{filtered.length}</span>
              {q && (
                <div className="actions" style={{ opacity: 1 }}>
                  <button
                    className="tm-btn ghost sm"
                    onClick={() => setQuery("")}
                  >
                    {t.search.clear}
                  </button>
                </div>
              )}
            </div>

            {allDisplayGroups.length > 1 && (
              <div className="tm-group-filter-bar">
                {allDisplayGroups.map((g) => (
                  <button
                    key={g.name}
                    className={`tm-group-filter ${q === g.name ? "active" : ""}`}
                    onClick={() => {
                      const nextQuery = q === g.name ? "" : g.name;
                      setQuery(nextQuery);
                      setCollapsedGroups((current) => {
                        if (!current.has(g.name)) return current;
                        const next = new Set(current);
                        next.delete(g.name);
                        return next;
                      });
                    }}
                  >
                    <span className={`tm-group-dot gd-${g.color}`} />
                    <span className="tm-group-filter-name">{g.name}</span>
                    <span className="tm-group-count">{g.tabs.length}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="tm-tabs-list">
              {displayGroups.map((g) => (
                <div
                  key={g.name}
                  className={`tm-section ${collapsedGroups.has(g.name) ? "is-collapsed" : ""}`}
                >
                  <GroupHeader
                    name={g.name}
                    count={g.tabs.length}
                    color={g.color}
                    mode={grouping}
                    t={t}
                    headerStyle={groupHeader}
                    collapsed={collapsedGroups.has(g.name)}
                    onToggle={() => toggleGroup(g.name)}
                    onCloseAll={() => {
                      setConfirmAction({
                        title: `Close ${g.tabs.length} tabs?`,
                        message: `All tabs in "${g.name}" will be closed. You can restore them from Recently Closed.`,
                        onConfirm: () => {
                          g.tabs.forEach((tab) => closeTab(tab.id));
                          showToast({ msg: `Closed ${g.tabs.length} tabs in ${g.name}` });
                          setConfirmAction(null);
                        },
                      });
                    }}
                  />
                  {!collapsedGroups.has(g.name) && (
                    <div className="tm-group-scroll">
                      <div className={`tm-tab-grid ${cardCols}`}>
                        {g.tabs.map((tab) => (
                          <TabCard
                            key={tab.id}
                            tab={tab}
                            density={density}
                            layout={tabsLayout}
                            isDuplicate={dupSet.has(tab.url)}
                            query={q}
                            onClose={handleClose}
                            onOpen={handleOpen}
                            onReadLater={handleReadLater}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="tm-empty">
                  {q ? t.search.noResults : t.empty.tabs}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="tm-home-side">
          {topSitesStyle !== "hidden" && sites.length > 0 && (
            <div className="tm-work-card tm-side-card-fit">
              <div className="tm-section-hd">
                <h2>{t.tabs.topSites}</h2>
                <span className="meta">{sites.length}</span>
              </div>
              <div>
                <TopSites
                  sites={sites}
                  variant={topSitesStyle}
                  onOpen={handleOpenUrl}
                />
              </div>
            </div>
          )}

          {readingCount > 0 && (
            <div className="tm-work-card tm-side-card-medium">
              <ReadingListSection t={t} />
            </div>
          )}

          <div className="tm-work-card tm-side-card-large">
            <RecentlyClosedList
              items={recentlyClosed}
              t={t}
              onRestore={handleRestore}
            />
          </div>
        </aside>
      </div>

      {confirmAction && (
        <ConfirmDialog
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={t.tabs.closeAll}
          onConfirm={confirmAction.onConfirm}
          onCancel={() => setConfirmAction(null)}
          danger
        />
      )}
    </div>
  );
}
