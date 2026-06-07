"use client";

/**
 * ShimmerButton
 * Адаптация magicui Shimmer Button (dillionverma) — CSS-only, без motion.
 * Источник: https://21st.dev/r/dillionverma/shimmer-button (magicui.design).
 *
 * Отличия от оригинала (адаптация под наши токены, UI_REDESIGN_PLAN T-3.1):
 *  - фон → var(--gradient-primary) (кислотно-зелёный), текст ЧЁРНЫЙ (--primary-foreground);
 *  - shimmer-цвет → светлый край;
 *  - prefers-reduced-motion → блик отключается, остаётся статичная градиентная кнопка.
 */

import * as React from "react";

import { cn } from "@/shared/lib";

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Цвет бегущего блика */
  shimmerColor?: string;
  /** Толщина блика */
  shimmerSize?: string;
  /** Длительность одного прохода блика */
  shimmerDuration?: string;
  /** Радиус скругления */
  borderRadius?: string;
  /** Цвет фона (по умолчанию — градиент primary) */
  background?: string;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "rgba(255, 255, 255, 0.9)",
      shimmerSize = "0.05em",
      shimmerDuration = "2.5s",
      borderRadius = "var(--radius-lg)",
      background = "var(--gradient-primary)",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            "--shimmer-color": shimmerColor,
            "--shimmer-size": shimmerSize,
            "--shimmer-duration": shimmerDuration,
            "--shimmer-radius": borderRadius,
            "--shimmer-bg": background,
          } as React.CSSProperties
        }
        className={cn(
          "group relative z-0 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden whitespace-nowrap",
          "px-6 py-3 font-mono text-sm font-medium",
          "[border-radius:var(--shimmer-radius)] [background:var(--shimmer-bg)]",
          "text-[var(--primary-foreground)] shadow-sm",
          "transition-transform duration-150 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {/* Бегущий блик — отключается при reduced-motion */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 overflow-hidden [border-radius:var(--shimmer-radius)]",
            "motion-reduce:hidden",
          )}
        >
          <span className="absolute inset-[-100%] animate-shimmer-spin [background:conic-gradient(from_calc(270deg-(var(--spread,90deg)*0.5)),transparent_0,var(--shimmer-color)_var(--spread,90deg),transparent_var(--spread,90deg))]" />
        </span>

        {children}

        {/* Highlight на hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 [border-radius:var(--shimmer-radius)] bg-white/0 transition-colors duration-200 group-hover:bg-white/10"
        />
      </button>
    );
  },
);
ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
