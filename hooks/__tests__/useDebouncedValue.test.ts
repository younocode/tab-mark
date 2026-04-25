import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebouncedValue } from "../useDebouncedValue";

describe("useDebouncedValue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebouncedValue("hello"));
    expect(result.current).toBe("hello");
  });

  it("updates to new value after delay", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 150),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    expect(result.current).toBe("a");

    act(() => { vi.advanceTimersByTime(150); });
    expect(result.current).toBe("b");
  });

  it("only returns the last value on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 100),
      { initialProps: { value: "first" } },
    );

    rerender({ value: "second" });
    act(() => { vi.advanceTimersByTime(50); });

    rerender({ value: "third" });
    act(() => { vi.advanceTimersByTime(50); });

    // "second" timer was cleared; "third" hasn't elapsed yet
    expect(result.current).toBe("first");

    act(() => { vi.advanceTimersByTime(50); });
    expect(result.current).toBe("third");
  });
});
