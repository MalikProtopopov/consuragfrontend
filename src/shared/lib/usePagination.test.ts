import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PAGE_SIZE } from "@/shared/config";

import { usePagination } from "./usePagination";

describe("usePagination", () => {
  it("начальное состояние с дефолтным limit", () => {
    const { result } = renderHook(() => usePagination());
    expect(result.current.page).toBe(0);
    expect(result.current.limit).toBe(PAGE_SIZE);
    expect(result.current.skip).toBe(0);
    expect(result.current.hasPrev).toBe(false);
    // total ещё неизвестен → totalPages 0, hasNext false
    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNext).toBe(false);
  });

  it("skip = page * limit", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(100));
    act(() => result.current.next());
    expect(result.current.page).toBe(1);
    expect(result.current.skip).toBe(PAGE_SIZE);
  });

  it("totalPages вычисляется по total (округление вверх)", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(45));
    // ceil(45 / 20) = 3
    expect(result.current.totalPages).toBe(3);
  });

  it("hasNext / hasPrev на границах", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(50)); // 3 страницы: 0,1,2

    expect(result.current.hasPrev).toBe(false);
    expect(result.current.hasNext).toBe(true);

    act(() => result.current.next()); // page 1
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasNext).toBe(true);

    act(() => result.current.next()); // page 2 (последняя)
    expect(result.current.hasPrev).toBe(true);
    expect(result.current.hasNext).toBe(false);
  });

  it("prev не уходит ниже 0", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.prev());
    expect(result.current.page).toBe(0);
  });

  it("next/prev переключают страницы", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(100));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.page).toBe(2);
    act(() => result.current.prev());
    expect(result.current.page).toBe(1);
  });

  it("setPage клампит отрицательные в 0", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setPage(5));
    expect(result.current.page).toBe(5);
    act(() => result.current.setPage(-3));
    expect(result.current.page).toBe(0);
  });

  it("reset возвращает на первую страницу", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(100));
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.page).toBe(2);
    act(() => result.current.reset());
    expect(result.current.page).toBe(0);
  });

  it("setTotal с undefined сбрасывает totalPages/hasNext", () => {
    const { result } = renderHook(() => usePagination());
    act(() => result.current.setTotal(100));
    expect(result.current.totalPages).toBeGreaterThan(0);
    act(() => result.current.setTotal(undefined));
    expect(result.current.totalPages).toBe(0);
    expect(result.current.hasNext).toBe(false);
  });

  it("кастомный limit и initialPage", () => {
    const { result } = renderHook(() => usePagination({ limit: 10, initialPage: 2 }));
    expect(result.current.limit).toBe(10);
    expect(result.current.page).toBe(2);
    expect(result.current.skip).toBe(20);
    act(() => result.current.setTotal(35));
    // ceil(35 / 10) = 4
    expect(result.current.totalPages).toBe(4);
  });
});
