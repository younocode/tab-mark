import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";
import { chromeMock } from "./mocks/chrome";

(globalThis as any).chrome = chromeMock;

beforeEach(() => {
  vi.clearAllMocks();
});
