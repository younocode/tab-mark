import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTagStore } from "../tagStore";

describe("tagStore", () => {
  beforeEach(() => {
    useTagStore.setState({ tags: {} });
    vi.clearAllMocks();
  });

  describe("getAllTags", () => {
    it("returns all unique tags sorted", () => {
      useTagStore.setState({
        tags: {
          "bm-1": ["react", "js"],
          "bm-2": ["react", "css"],
        },
      });
      expect(useTagStore.getState().getAllTags()).toEqual(["css", "js", "react"]);
    });

    it("returns empty array when no tags", () => {
      expect(useTagStore.getState().getAllTags()).toEqual([]);
    });
  });

  describe("setTags", () => {
    it("updates tags for a bookmark", async () => {
      await useTagStore.getState().setTags("bm-1", ["tag1", "tag2"]);
      expect(useTagStore.getState().tags["bm-1"]).toEqual(["tag1", "tag2"]);
    });

    it("removes key when tags are empty", async () => {
      useTagStore.setState({ tags: { "bm-1": ["old"] } });
      await useTagStore.getState().setTags("bm-1", []);
      expect(useTagStore.getState().tags["bm-1"]).toBeUndefined();
    });

    it("persists to chrome.storage.local", async () => {
      await useTagStore.getState().setTags("bm-1", ["saved"]);
      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        expect.objectContaining({
          tabmark_bookmark_tags: expect.objectContaining({ "bm-1": ["saved"] }),
        }),
      );
    });
  });

  describe("addTag", () => {
    it("appends a new tag", async () => {
      useTagStore.setState({ tags: { "bm-1": ["existing"] } });
      await useTagStore.getState().addTag("bm-1", "new");
      expect(useTagStore.getState().tags["bm-1"]).toEqual(["existing", "new"]);
    });

    it("does not add duplicate tag", async () => {
      useTagStore.setState({ tags: { "bm-1": ["existing"] } });
      await useTagStore.getState().addTag("bm-1", "existing");
      expect(useTagStore.getState().tags["bm-1"]).toEqual(["existing"]);
    });
  });

  describe("removeTag", () => {
    it("removes a specific tag", async () => {
      useTagStore.setState({ tags: { "bm-1": ["a", "b", "c"] } });
      await useTagStore.getState().removeTag("bm-1", "b");
      expect(useTagStore.getState().tags["bm-1"]).toEqual(["a", "c"]);
    });
  });
});
