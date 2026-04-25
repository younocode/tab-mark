import { useMemo, useCallback } from "react";
import { TopSites } from "./TopSites";
import { TabCard } from "./TabCard";
import { GroupHeader } from "./TabGroup";
import { RecentlyClosedList } from "./RecentlyClosed";
import { useTabStore } from "../stores/tabStore";
import { useTabGroupStore } from "../stores/tabGroupStore";
import { useSessionStore } from "../stores/sessionStore";
import { useTopSitesStore } from "../stores/topSitesStore";
import { usePreferenceStore } from "../stores/preferenceStore";
import { buildGroups } from "../utils/grouping";
import { matchesQuery } from "../utils/search";
import type { Translations } from "../utils/i18n";
import type { Tab } from "../types";
import type { ToastData } from "./Toast";

interface TabsViewProps {
  query: string;
  setQuery: (q: string) => void;
  t: Translations;
  showToast: (data: ToastData) => void;
}

export function TabsView({ query, t, showToast }: TabsViewProps) {
  const tabs = useTabStore((s) => s.tabs);
  const closeTab = useTabStore((s) => s.closeTab);
  const activateTab = useTabStore((s) => s.activateTab);
  const groups = useTabGroupStore((s) => s.groups);
  const recentlyClosed = useSessionStore((s) => s.recentlyClosed);
  const restoreSession = useSessionStore((s) => s.restoreSession);
  const sites = useTopSitesStore((s) => s.sites);
  const topSitesStyle = usePreferenceStore((s) => s.topSitesStyle);
  const density = usePreferenceStore((s) => s.density);
  const tabsLayout = usePreferenceStore((s) => s.tabsLayout);
  const grouping = usePreferenceStore((s) => s.grouping);
  const groupHeader = usePreferenceStore((s) => s.groupHeader);

  const q = query.replace(/^@all\s*/i, "").trim();

  const filtered = useMemo(
    () =>
      !q
        ? tabs
        : tabs.filter((tab) =>
            matchesQuery(q, tab.title, tab.url),
          ),
    [tabs, q],
  );

  const displayGroups = useMemo(
    () => buildGroups(filtered, groups, grouping),
    [filtered, groups, grouping],
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

  return (
    <div className="tm-content">
      <TopSites
        sites={sites}
        variant={topSitesStyle}
        onOpen={handleOpenUrl}
      />

      {displayGroups.map((g) => (
        <div key={g.name} className="tm-section">
          <GroupHeader
            name={g.name}
            count={g.tabs.length}
            color={g.color}
            mode={grouping}
            t={t}
            headerStyle={groupHeader}
            onCloseAll={() => {
              g.tabs.forEach((tab) => closeTab(tab.id));
              showToast({
                msg: `Closed ${g.tabs.length} tabs in ${g.name}`,
                undoable: false,
              });
            }}
          />
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
              />
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "var(--fg-3)",
          }}
        >
          {q ? t.search.noResults : t.empty.tabs}
        </div>
      )}

      <RecentlyClosedList
        items={recentlyClosed}
        t={t}
        onRestore={handleRestore}
      />
    </div>
  );
}
