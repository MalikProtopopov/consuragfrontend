/**
 * DotPattern
 * Адаптация magicui Dot Pattern (CSS-only, без motion).
 * Источник: https://21st.dev/r/magicui/dot-pattern (magicui.design).
 *
 * Чистый SVG-паттерн точек на токенах проекта:
 *  - цвет по умолчанию → var(--border) (точки едва заметные);
 *  - шаг сетки задаётся через width/height, размер точки — cr;
 *  - декоративный фон-подложка (absolute inset-0), pointer-events-none.
 */

import * as React from "react";

import { cn } from "@/shared/lib";

export interface DotPatternProps extends React.SVGProps<SVGSVGElement> {
  /** Шаг сетки по горизонтали (px) */
  width?: number;
  /** Шаг сетки по вертикали (px) */
  height?: number;
  /** Смещение паттерна по X */
  x?: number;
  /** Смещение паттерна по Y */
  y?: number;
  /** Смещение точки внутри ячейки по X */
  cx?: number;
  /** Смещение точки внутри ячейки по Y */
  cy?: number;
  /** Радиус точки */
  cr?: number;
}

export function DotPattern({
  width = 16,
  height = 16,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}: DotPatternProps) {
  const id = React.useId();

  return (
    <svg
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-[var(--border)]",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          patternContentUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <circle cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
