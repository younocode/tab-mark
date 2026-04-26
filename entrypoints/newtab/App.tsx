import { useEffect, useState, useCallback } from "react";
import { NTPBar } from "../../components/NTPBar";
import { Toast, type ToastData } from "../../components/Toast";
import { ErrorBoundary } from "../../components/ErrorBoundary";
import { HomeView } from "../../components/HomeView";
import { DeadLinksHealthView } from "../../components/DeadLinksHealthView";
import { DuplicateBookmarksHealthView } from "../../components/DuplicateBookmarksHealthView";
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

export default function App() {
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState<ToastData | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [healthModal, setHealthModal] = useState<"dead" | "duplicates" | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const theme = usePreferenceStore((s) => s.theme);
  const lang = usePreferenceStore((s) => s.lang);

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
    if (healthModal) {
      useBookmarkStore.getState().init();
    }
  }, [healthModal]);

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
        setPaletteQuery("");
        setPaletteOpen(true);
      } else if (e.key === "Escape") {
        setQuery("");
        setPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const showToast = useCallback((data: ToastData) => {
    setToast(data);
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  const handlePaletteAction = useCallback((action: PaletteAction) => {
    if (action === "deadLinks") setHealthModal("dead");
    else if (action === "duplicateBookmarks") setHealthModal("duplicates");
    else if (action === "settings") setSettingsModalOpen(true);
  }, []);

  const openPalette = useCallback((initialQuery = "") => {
    setPaletteQuery(initialQuery);
    setPaletteOpen(true);
  }, []);

  return (
    <>
      <div className="tm-app">
        <main className="tm-main">
          <NTPBar t={t} onSearch={openPalette} />
          <ErrorBoundary>
            <HomeView
              query={query}
              setQuery={setQuery}
              t={t}
              showToast={showToast}
            />
          </ErrorBoundary>
        </main>
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onAction={handlePaletteAction}
          initialQuery={paletteQuery}
          t={t}
          showToast={showToast}
        />
      )}

      {healthModal === "dead" && (
        <PanelModal
          title={t.health.deadTitle}
          onClose={() => setHealthModal(null)}
        >
          <DeadLinksHealthView t={t} />
        </PanelModal>
      )}

      {healthModal === "duplicates" && (
        <PanelModal
          title={t.health.duplicatesTitle}
          onClose={() => setHealthModal(null)}
        >
          <DuplicateBookmarksHealthView t={t} />
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
