"use client";

import * as React from "react";

import { cn, type UsePaginationResult } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/shared/ui/pagination";

interface PaginationControlsBaseProps {
  pagination: UsePaginationResult;
  /** Общее число элементов с бэкенда. Прокидывается в хук (totalPages/hasNext). */
  total: number | undefined;
  className?: string;
}

/** Синхронизирует `total` из ответа API в состояние хука без рендер-фазных сетов. */
function useSyncTotal(pagination: UsePaginationResult, total: number | undefined): void {
  const { setTotal } = pagination;
  React.useEffect(() => {
    setTotal(total);
  }, [setTotal, total]);
}

/**
 * Простые кнопки «Назад / Вперёд» + «Страница X из Y».
 * Скрывается, если страница всего одна (`totalPages <= 1`).
 *
 * @example
 * const pagination = usePagination();
 * const { data } = useQuery({ skip: pagination.skip, limit: pagination.limit });
 * <PaginationControls pagination={pagination} total={data?.total} />
 */
export function PaginationControls({
  pagination,
  total,
  className,
  /** Текст кнопки «вперёд». В коде встречаются оба варианта: «Вперёд» и «Вперед». */
  nextLabel = "Вперёд",
}: PaginationControlsBaseProps & { nextLabel?: string }) {
  useSyncTotal(pagination, total);

  const { page, totalPages, hasPrev, hasNext, next, prev } = pagination;

  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <p className="text-sm text-text-muted">
        Страница {page + 1} из {totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={prev} disabled={!hasPrev}>
          Назад
        </Button>
        <Button variant="outline" size="sm" onClick={next} disabled={!hasNext}>
          {nextLabel}
        </Button>
      </div>
    </div>
  );
}

interface NumberedPaginationControlsProps extends PaginationControlsBaseProps {
  /** Сколько номеров страниц показывать. */
  maxButtons?: number;
  /**
   * «Окно» номеров вокруг текущей страницы (как на /admin/requests).
   * Если false — всегда показываются первые `maxButtons` страниц
   * (как на /admin/users и /admin/audit).
   */
  windowed?: boolean;
}

/**
 * Нумерованная пагинация на базе shadcn `<Pagination>`
 * (стрелки + номера страниц). Скрывается, если страница всего одна.
 */
export function NumberedPaginationControls({
  pagination,
  total,
  className,
  maxButtons = 5,
  windowed = true,
}: NumberedPaginationControlsProps) {
  useSyncTotal(pagination, total);

  const { page, totalPages, setPage } = pagination;

  if (totalPages <= 1) return null;

  const count = Math.min(totalPages, maxButtons);

  return (
    <div className={cn("mt-6", className)}>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page > 0) setPage(page - 1);
              }}
            />
          </PaginationItem>
          {Array.from({ length: count }).map((_, i) => {
            let pageNum = i;
            if (windowed && totalPages > maxButtons) {
              const half = Math.floor(maxButtons / 2);
              if (page < half) {
                pageNum = i;
              } else if (page > totalPages - (maxButtons - half)) {
                pageNum = totalPages - maxButtons + i;
              } else {
                pageNum = page - half + i;
              }
            }
            return (
              <PaginationItem key={pageNum}>
                <PaginationLink
                  href="#"
                  isActive={page === pageNum}
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(pageNum);
                  }}
                >
                  {pageNum + 1}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages - 1) setPage(page + 1);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
