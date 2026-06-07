import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCountdown } from "./useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("по умолчанию неактивен", () => {
    const { result } = renderHook(() => useCountdown());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isActive).toBe(false);
    expect(result.current.formatted).toBe("0:00");
  });

  it("стартует с переданного initialSeconds", () => {
    const { result } = renderHook(() => useCountdown(10));
    expect(result.current.secondsLeft).toBe(10);
    expect(result.current.isActive).toBe(true);
    expect(result.current.formatted).toBe("0:10");
  });

  it("start запускает отсчёт", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(5));
    expect(result.current.secondsLeft).toBe(5);
    expect(result.current.isActive).toBe(true);
  });

  it("тикает раз в секунду", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(3));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(2);
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(1);
    expect(result.current.formatted).toBe("0:01");
  });

  it("автостоп на нуле", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(2));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isActive).toBe(false);
    // дальнейшие тики ничего не меняют
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.secondsLeft).toBe(0);
  });

  it("stop немедленно сбрасывает", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(60));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.secondsLeft).toBe(59);
    act(() => result.current.stop());
    expect(result.current.secondsLeft).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("start клампит отрицательные/дробные", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(-5));
    expect(result.current.secondsLeft).toBe(0);
    act(() => result.current.start(5.9));
    expect(result.current.secondsLeft).toBe(5);
  });

  it("formatted отражает mm:ss", () => {
    const { result } = renderHook(() => useCountdown());
    act(() => result.current.start(125));
    expect(result.current.formatted).toBe("2:05");
  });
});
