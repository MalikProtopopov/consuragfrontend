"use client";

/**
 * NumberTicker
 * Адаптация magicui Number Ticker (dillionverma) на пакет `motion`.
 * Источник: https://21st.dev/r/dillionverma/number-ticker (magicui.design).
 *
 * Отличия от оригинала (адаптация под наши токены, UI_REDESIGN_PLAN T-3.2):
 *  - моноширинные tabular-nums по умолчанию;
 *  - локаль ru-RU для разделителей разрядов (как в существующих форматтерах);
 *  - prefers-reduced-motion (useReducedMotion) → сразу финальное значение, без анимации.
 */

import * as React from "react";

import { useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react";

import { cn } from "@/shared/lib";

export interface NumberTickerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Целевое значение */
  value: number;
  /** Стартовое значение анимации */
  startValue?: number;
  /** Задержка перед стартом (сек) */
  delay?: number;
  /** Число знаков после запятой */
  decimalPlaces?: number;
  /** Локаль форматирования */
  locale?: string;
}

const NumberTicker = React.forwardRef<HTMLSpanElement, NumberTickerProps>(
  (
    {
      value,
      startValue = 0,
      delay = 0,
      decimalPlaces = 0,
      locale = "ru-RU",
      className,
      ...props
    },
    forwardedRef,
  ) => {
    const localRef = React.useRef<HTMLSpanElement>(null);
    React.useImperativeHandle(forwardedRef, () => localRef.current as HTMLSpanElement);

    const prefersReducedMotion = useReducedMotion();
    const motionValue = useMotionValue(startValue);
    const springValue = useSpring(motionValue, {
      damping: 60,
      stiffness: 100,
    });
    const isInView = useInView(localRef, { once: true, margin: "0px" });

    const format = React.useCallback(
      (n: number) =>
        Intl.NumberFormat(locale, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces,
        }).format(Number(n.toFixed(decimalPlaces))),
      [locale, decimalPlaces],
    );

    React.useEffect(() => {
      // Reduced-motion: показываем финал сразу, без анимации.
      if (prefersReducedMotion) {
        if (localRef.current) {
          localRef.current.textContent = format(value);
        }
        return;
      }
      if (!isInView) return;
      const timer = setTimeout(() => {
        motionValue.set(value);
      }, delay * 1000);
      return () => clearTimeout(timer);
    }, [motionValue, isInView, delay, value, prefersReducedMotion, format]);

    React.useEffect(() => {
      if (prefersReducedMotion) return;
      const unsubscribe = springValue.on("change", (latest) => {
        if (localRef.current) {
          localRef.current.textContent = format(latest);
        }
      });
      return () => unsubscribe();
    }, [springValue, prefersReducedMotion, format]);

    return (
      <span
        ref={localRef}
        className={cn("inline-block font-mono tabular-nums", className)}
        {...props}
      >
        {/* Серверный/первый рендер — финальное значение (SSR-безопасно, без скачка для reduced-motion) */}
        {prefersReducedMotion ? format(value) : format(startValue)}
      </span>
    );
  },
);
NumberTicker.displayName = "NumberTicker";

export { NumberTicker };
