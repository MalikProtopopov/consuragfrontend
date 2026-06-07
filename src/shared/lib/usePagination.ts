"use client";

import * as React from "react";

import { PAGE_SIZE } from "@/shared/config";

export interface UsePaginationOptions {
  /** Размер страницы. По умолчанию PAGE_SIZE из @/shared/config. */
  limit?: number;
  /** Начальная страница (0-based). */
  initialPage?: number;
}

export interface UsePaginationResult {
  /** Текущая страница (0-based). */
  page: number;
  /** Смещение для запроса: page * limit. */
  skip: number;
  /** Размер страницы. */
  limit: number;
  /** Всего страниц (по total). */
  totalPages: number;
  /** Есть ли следующая страница. */
  hasNext: boolean;
  /** Есть ли предыдущая страница. */
  hasPrev: boolean;
  /** Перейти на следующую страницу (с учётом hasNext). */
  next: () => void;
  /** Перейти на предыдущую страницу (с учётом hasPrev). */
  prev: () => void;
  /** Установить произвольную страницу (клампится в [0, totalPages-1] при известном total). */
  setPage: (page: number) => void;
  /** Сбросить на первую страницу (удобно при смене фильтров). */
  reset: () => void;
  /** Сообщить хуку общее число элементов с бэкенда (для totalPages/hasNext). */
  setTotal: (total: number | undefined) => void;
}

/**
 * Единый хук пагинации skip/limit для таблиц.
 *
 * Паттерн: хук хранит `page`, запрос использует `skip`/`limit`,
 * после ответа отдаём `total` обратно через `setTotal` (или сразу
 * передаём в `<PaginationControls total={...} />` — он вызывает setTotal сам).
 *
 * @example
 * const pagination = usePagination();
 * const { data } = useQuery({ skip: pagination.skip, limit: pagination.limit });
 * <PaginationControls pagination={pagination} total={data?.total} />
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationResult {
  const { limit = PAGE_SIZE, initialPage = 0 } = options;

  const [page, setPageState] = React.useState(initialPage);
  const [total, setTotalState] = React.useState<number | undefined>(undefined);

  const totalPages = total !== undefined ? Math.ceil(total / limit) : 0;
  const skip = page * limit;
  const hasPrev = page > 0;
  const hasNext = total !== undefined ? (page + 1) * limit < total : false;

  const setTotal = React.useCallback((next: number | undefined) => {
    setTotalState((prev) => (prev === next ? prev : next));
  }, []);

  const setPage = React.useCallback((next: number) => {
    setPageState(Math.max(0, next));
  }, []);

  const next = React.useCallback(() => {
    setPageState((p) => p + 1);
  }, []);

  const prev = React.useCallback(() => {
    setPageState((p) => Math.max(0, p - 1));
  }, []);

  const reset = React.useCallback(() => {
    setPageState(0);
  }, []);

  return {
    page,
    skip,
    limit,
    totalPages,
    hasNext,
    hasPrev,
    next,
    prev,
    setPage,
    reset,
    setTotal,
  };
}
