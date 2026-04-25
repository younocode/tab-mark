import { vi } from "vitest";

function makeEvent() {
  return {
    addListener: vi.fn(),
    removeListener: vi.fn(),
    hasListener: vi.fn(() => false),
  };
}

function makeStorageArea() {
  return {
    get: vi.fn().mockResolvedValue({}),
    set: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(undefined),
  };
}

export const chromeMock = {
  storage: {
    local: makeStorageArea(),
    onChanged: makeEvent(),
  },
  runtime: {
    onMessage: makeEvent(),
    onInstalled: makeEvent(),
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
  bookmarks: {
    getTree: vi.fn().mockResolvedValue([]),
    remove: vi.fn().mockResolvedValue(undefined),
    removeTree: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: "new-1" }),
    update: vi.fn().mockResolvedValue({}),
    onCreated: makeEvent(),
    onRemoved: makeEvent(),
    onChanged: makeEvent(),
    onMoved: makeEvent(),
  },
  tabs: {
    query: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 1 }),
  },
  tabGroups: {
    query: vi.fn().mockResolvedValue([]),
  },
  i18n: {
    getUILanguage: vi.fn(() => "en"),
  },
  history: {
    search: vi.fn().mockResolvedValue([]),
  },
  readingList: {
    query: vi.fn().mockResolvedValue([]),
    removeEntry: vi.fn().mockResolvedValue(undefined),
    updateEntry: vi.fn().mockResolvedValue(undefined),
    onEntryAdded: makeEvent(),
    onEntryRemoved: makeEvent(),
    onEntryUpdated: makeEvent(),
  },
};
