import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "../../components/Sidebar";
import { NTPBar } from "../../components/NTPBar";
import { TopBar } from "../../components/TopBar";
import { Toast, type ToastData } from "../../components/Toast";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { TabsView } from "../../components/TabsView";
import { BookmarksView } from "../../components/BookmarksView";
import { HealthView } from "../../components/HealthView";
import { CommandPalette } from "../../components/CommandPalette";
import { SnapshotsModal } from "../../components/SnapshotsModal";
import { usePreferenceStore } from "../../stores/preferenceStore";
import { useTabStore } from "../../stores/tabStore";
import { useTabGroupStore } from "../../stores/tabGroupStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useTopSitesStore } from "../../stores/topSitesStore";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useSnapshotStore } from "../../stores/snapshotStore";
import { useTagStore } from "../../stores/tagStore";
import { useTheme } from "../../hooks/useTheme";
import { getTranslations } from "../../utils/i18n";
import type { ViewId } from "../../types";
import { flattenBookmarks } from "../../utils/bookmarks";

export default function App() {
  const defaultView = usePreferenceStore((s) => s.defaultView);
  const [view, setView] = useState<ViewId>(defaultView);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [snapshotsOpen, setSnapshotsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const theme = usePreferenceStore((s) => s.theme);
  const lang = usePreferenceStore((s) => s.lang);
  const setPref = usePreferenceStore((s) => s.set);
  const tabs = useTabStore((s) => s.tabs);
  const bookmarkTree = useBookmarkStore((s) => s.tree);

  useTheme(theme);
  const t = getTranslations(lang);

  useEffect(() => {
    Promise.all([
      usePreferenceStore.getState().init(),
      useTabStore.getState().init(),
      useTabGroupStore.getState().init(),
      useSessionStore.getState().init(),
      useTopSitesStore.getState().init(),
      useSnapshotStore.getState().init(),
      useTagStore.getState().init(),
    ]);
  }, []);

  useEffect(() => {
    if (view === "bookmarks" || view === "health") {
      useBookmarkStore.getState().init();
    }
  }, [view]);

  // Refresh recently closed when a tab is removed
  useEffect(() => {
    const refresh = () => useSessionStore.getState().refresh();
    chrome.tabs.onRemoved.addListener(refresh);
    return () => chrome.tabs.onRemoved.removeListener(refresh);
  }, []);

  // Responsive sidebar collapse
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const onChange = () => setSidebarCollapsed(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen(true);
      } else if (e.key === "Escape") {
        setQuery("");
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // @all triggers CommandPalette
  useEffect(() => {
    if (query.startsWith("@all") && query.length >= 4 && !paletteOpen) {
      setPaletteOpen(true);
      setQuery("");
    }
  }, [query, paletteOpen]);

  const handleSetView = useCallback(
    (v: ViewId) => {
      setView(v);
      setQuery("");
    },
    [],
  );

  const showToast = useCallback((data: ToastData) => {
    setToast(data);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const toggleLang = useCallback(() => {
    setPref("lang", lang === "en" ? "zh" : "en");
  }, [lang, setPref]);

  const bookmarkCount = flattenBookmarks(bookmarkTree).length;

  return (
    <>
      <div className="tm-app">
        <Sidebar
          view={view}
          setView={handleSetView}
          t={t}
          tabCount={tabs.length}
          bookmarkCount={bookmarkCount}
          collapsed={sidebarCollapsed}
          onOpenSnapshots={() => setSnapshotsOpen(true)}
        />
        <main className="tm-main">
          {view === "tabs" ? (
            <NTPBar lang={lang} />
          ) : (
            <TopBar
              query={query}
              setQuery={setQuery}
              t={t}
              view={view}
              lang={lang}
              onToggleLang={toggleLang}
            />
          )}
          <ErrorBoundary>
            {view === "tabs" && (
              <TabsView
                query={query}
                setQuery={setQuery}
                t={t}
                showToast={showToast}
              />
            )}
            {view === "bookmarks" && (
              <BookmarksView
                query={query}
                t={t}
              />
            )}
            {view === "health" && (
              <HealthView t={t} />
            )}
            {view === "settings" && (
              <SettingsView t={t} />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          t={t}
          showToast={showToast}
        />
      )}

      {snapshotsOpen && (
        <SnapshotsModal
          onClose={() => setSnapshotsOpen(false)}
          t={t}
        />
      )}

      <Toast toast={toast} dismiss={dismissToast} />
    </>
  );
}

function SettingsView({ t }: { t: ReturnType<typeof getTranslations> }) {
  const theme = usePreferenceStore((s) => s.theme);
  const lang = usePreferenceStore((s) => s.lang);
  const defaultView = usePreferenceStore((s) => s.defaultView);
  const topSitesStyle = usePreferenceStore((s) => s.topSitesStyle);
  const topSitesCount = usePreferenceStore((s) => s.topSitesCount);
  const density = usePreferenceStore((s) => s.density);
  const tabsLayout = usePreferenceStore((s) => s.tabsLayout);
  const grouping = usePreferenceStore((s) => s.grouping);
  const groupHeader = usePreferenceStore((s) => s.groupHeader);
  const setPref = usePreferenceStore((s) => s.set);

  return (
    <div className="tm-content" style={{ maxWidth: 640 }}>
      <div className="tm-section">
        <div className="tm-section-hd">
          <h2>{t.settings.appearance}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <SettingRow label={t.settings.theme}>
            <div className="tm-segmented">
              {(["system", "light", "dark"] as const).map((v) => (
                <button
                  key={v}
                  className={theme === v ? "active" : ""}
                  onClick={() => setPref("theme", v)}
                >
                  {v === "system" ? t.settings.themeSystem : v === "light" ? t.settings.themeLight : t.settings.themeDark}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.language}>
            <div className="tm-segmented">
              {(["en", "zh"] as const).map((v) => (
                <button
                  key={v}
                  className={lang === v ? "active" : ""}
                  onClick={() => setPref("lang", v)}
                >
                  {v === "en" ? "English" : "中文"}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.defaultView}>
            <div className="tm-segmented">
              {(["tabs", "bookmarks"] as const).map((v) => (
                <button
                  key={v}
                  className={defaultView === v ? "active" : ""}
                  onClick={() => setPref("defaultView", v)}
                >
                  {v === "tabs" ? t.nav.tabs : t.nav.bookmarks}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.topSites}>
            <div className="tm-segmented">
              {(["big", "small", "compact", "hidden"] as const).map((v) => (
                <button
                  key={v}
                  className={topSitesStyle === v ? "active" : ""}
                  onClick={() => setPref("topSitesStyle", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label={t.settings.topSitesCount}>
            <div className="tm-segmented">
              {([4, 6, 8] as const).map((v) => (
                <button
                  key={v}
                  className={topSitesCount === v ? "active" : ""}
                  onClick={() => setPref("topSitesCount", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Density">
            <div className="tm-segmented">
              {(["compact", "comfortable", "spacious"] as const).map((v) => (
                <button
                  key={v}
                  className={density === v ? "active" : ""}
                  onClick={() => setPref("density", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Layout">
            <div className="tm-segmented">
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  className={tabsLayout === v ? "active" : ""}
                  onClick={() => setPref("tabsLayout", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Grouping">
            <div className="tm-segmented">
              {(["chrome", "domain"] as const).map((v) => (
                <button
                  key={v}
                  className={grouping === v ? "active" : ""}
                  onClick={() => setPref("grouping", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
          <SettingRow label="Group Header">
            <div className="tm-segmented">
              {(["row", "card", "pill"] as const).map((v) => (
                <button
                  key={v}
                  className={groupHeader === v ? "active" : ""}
                  onClick={() => setPref("groupHeader", v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}
