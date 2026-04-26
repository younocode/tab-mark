import { describe, it, expect, beforeEach } from "vitest";
import { useHealthStore } from "../healthStore";
import type { HealthResult, DuplicateGroup } from "../../types";

function makeDeadLink(overrides: Partial<HealthResult> = {}): HealthResult {
  return {
    bookmarkId: "bm-1",
    url: "https://dead.com",
    title: "Dead Link",
    status: "dead",
    severity: "dead",
    ...overrides,
  };
}

function makeDuplicateGroup(overrides: Partial<DuplicateGroup> = {}): DuplicateGroup {
  return {
    url: "https://dup.com",
    title: "Dup",
    bookmarkIds: ["a", "b", "c"],
    paths: ["https://dup.com", "https://dup.com", "https://dup.com"],
    folderPaths: ["Bar", "Other", "Dev"],
    ...overrides,
  };
}

describe("healthStore", () => {
  beforeEach(() => {
    useHealthStore.setState({
      scanning: false,
      paused: false,
      progress: { checked: 0, total: 0 },
      deadLinks: [],
      duplicates: [],
    });
  });

  describe("addDeadLink", () => {
    it("appends to deadLinks array", () => {
      const link = makeDeadLink();
      useHealthStore.getState().addDeadLink(link);
      expect(useHealthStore.getState().deadLinks).toHaveLength(1);
      expect(useHealthStore.getState().deadLinks[0]).toEqual(link);
    });

    it("accumulates multiple links", () => {
      useHealthStore.getState().addDeadLink(makeDeadLink({ bookmarkId: "1" }));
      useHealthStore.getState().addDeadLink(makeDeadLink({ bookmarkId: "2" }));
      expect(useHealthStore.getState().deadLinks).toHaveLength(2);
    });
  });

  describe("removeDeadLink", () => {
    it("removes by bookmarkId", () => {
      useHealthStore.setState({
        deadLinks: [
          makeDeadLink({ bookmarkId: "1" }),
          makeDeadLink({ bookmarkId: "2" }),
        ],
      });
      useHealthStore.getState().removeDeadLink("1");
      const remaining = useHealthStore.getState().deadLinks;
      expect(remaining).toHaveLength(1);
      expect(remaining[0].bookmarkId).toBe("2");
    });
  });

  describe("removeDuplicate", () => {
    it("removes ID from matching group + associated paths/folderPaths", () => {
      useHealthStore.setState({
        duplicates: [makeDuplicateGroup()],
      });
      useHealthStore.getState().removeDuplicate("https://dup.com", "b");
      const group = useHealthStore.getState().duplicates[0];
      expect(group.bookmarkIds).toEqual(["a", "c"]);
      expect(group.paths).toHaveLength(2);
      expect(group.folderPaths).toEqual(["Bar", "Dev"]);
    });

    it("removes entire group when only 1 item left", () => {
      useHealthStore.setState({
        duplicates: [
          makeDuplicateGroup({
            bookmarkIds: ["a", "b"],
            paths: ["u1", "u2"],
            folderPaths: ["p1", "p2"],
          }),
        ],
      });
      useHealthStore.getState().removeDuplicate("https://dup.com", "a");
      expect(useHealthStore.getState().duplicates).toHaveLength(0);
    });

    it("does not affect other groups", () => {
      useHealthStore.setState({
        duplicates: [
          makeDuplicateGroup({ url: "https://a.com" }),
          makeDuplicateGroup({ url: "https://b.com" }),
        ],
      });
      useHealthStore.getState().removeDuplicate("https://a.com", "b");
      expect(useHealthStore.getState().duplicates).toHaveLength(2);
    });
  });

  describe("removeAllDead", () => {
    it("clears deadLinks", () => {
      useHealthStore.setState({
        deadLinks: [makeDeadLink(), makeDeadLink({ bookmarkId: "2" })],
      });
      useHealthStore.getState().removeAllDead();
      expect(useHealthStore.getState().deadLinks).toEqual([]);
    });
  });

  describe("basic setters", () => {
    it("setScanning", () => {
      useHealthStore.getState().setScanning(true);
      expect(useHealthStore.getState().scanning).toBe(true);
    });

    it("setPaused", () => {
      useHealthStore.getState().setPaused(true);
      expect(useHealthStore.getState().paused).toBe(true);
    });

    it("setProgress", () => {
      useHealthStore.getState().setProgress({ checked: 5, total: 10 });
      expect(useHealthStore.getState().progress).toEqual({ checked: 5, total: 10 });
    });
  });
});
