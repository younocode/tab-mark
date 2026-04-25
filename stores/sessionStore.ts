import { create } from "zustand";
import type { RecentlyClosed } from "../types";

interface SessionStore {
  recentlyClosed: RecentlyClosed[];
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  restoreSession: (sessionId: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((setState, getState) => ({
  recentlyClosed: [],

  init: async () => {
    await getState().refresh();
  },

  refresh: async () => {
    const sessions = await chrome.sessions.getRecentlyClosed({ maxResults: 25 });
    setState({ recentlyClosed: sessions as RecentlyClosed[] });
  },

  restoreSession: async (sessionId) => {
    await chrome.sessions.restore(sessionId);
    await getState().refresh();
  },
}));
