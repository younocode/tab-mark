import { useEffect, useState, useCallback } from "react";
import { HeaderBar } from "../../components/HeaderBar";
import { NTPBar } from "../../components/NTPBar";
import { Toast, type ToastData } from "../../components/Toast";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { HomeView } from "../../components/HomeView";
import { BookmarksView } from "../../components/BookmarksView";
import { HealthView } from "../../components/HealthView";
import { SettingsView } from "../../components/SettingsView";
import { PanelModal } from "../../components/PanelModal";
import { CommandPalette, type PaletteAction } from "../../components/CommandPalette";
import { usePreferenceStore } from "../../stores/preferenceStore";
import { useTabStore } from "../../stores/tabStore";
import { useTabGroupStore } from "../../stores/tabGroupStore";
import { useSessionStore } from "../../stores/sessionStore";
import { useTopSitesStore } from "../../stores/topSitesStore";
import { useBookmarkStore } from "../../stores/bookmarkStore";
import { useReadingListStore } from "../../stores/readingListStore";
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
  const [healthModalOpen, setHealthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const theme = usePreferenceStore((s) => s.theme);
  const lang = usePreferenceStore((s) => s.lang);
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
      useReadingListStore.getState().init(),
    ]);
  }, []);

  useEffect(() => {
    if (view === "bookmarks" || healthModalOpen) {
      useBookmarkStore.getState().init();
    }
  }, [view, healthModalOpen]);

  useEffect(() => {
    const refresh = () => useSessionStore.getState().refresh();
    chrome.tabs.onRemoved.addListener(refresh);
    return () => chrome.tabs.onRemoved.removeListener(refresh);
  }, []);

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

  const handlePaletteAction = useCallback((action: PaletteAction) => {
    if (action === "health") setHealthModalOpen(true);
    else if (action === "settings") setSettingsModalOpen(true);
  }, []);

  const bookmarkCount = flattenBookmarks(bookmarkTree).length;

  return (
    <>
      <div className="tm-app">
        <HeaderBar
          view={view}
          setView={handleSetView}
          onOpenPalette={() => setPaletteOpen(true)}
          t={t}
          tabCount={tabs.length}
          bookmarkCount={bookmarkCount}
        />
        <main className="tm-main">
          {view === "home" && <NTPBar t={t} />}
          <ErrorBoundary>
            {view === "home" && (
              <HomeView
                query={query}
                setQuery={setQuery}
                t={t}
                showToast={showToast}
              />
            )}
            {view === "bookmarks" && (
              <BookmarksView
                query={query}
                setQuery={setQuery}
                t={t}
                showToast={showToast}
              />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onAction={handlePaletteAction}
          t={t}
          showToast={showToast}
        />
      )}

      {healthModalOpen && (
        <PanelModal
          title={t.health.title}
          onClose={() => setHealthModalOpen(false)}
        >
          <HealthView t={t} />
        </PanelModal>
      )}

      {settingsModalOpen && (
        <PanelModal
          title={t.nav.settings}
          onClose={() => setSettingsModalOpen(false)}
        >
          <SettingsView t={t} />
        </PanelModal>
      )}

      <Toast toast={toast} dismiss={dismissToast} />
    </>
  );
}
