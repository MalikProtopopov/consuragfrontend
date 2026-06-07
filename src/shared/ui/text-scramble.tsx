"use client";

/**
 * TextScramble
 * Адаптация motion-primitives Text Scramble (ibelick) на пакет `motion`.
 * Источник: https://21st.dev/r/motion-primitives/text-scramble (motion-primitives.com).
 *
 * Эффект: финальный текст «расшифровывается» из случайных символов за один проход.
 *
 * Отличия от оригинала (адаптация под наши токены, BRAND_POLISH_PLAN T-B.5):
 *  - charset — латиница+цифры+символы (не кириллица): кириллический финальный текст
 *    скрамблится латинскими глифами — читаемый «decrypt»-эффект под mono-айдентику;
 *  - prefers-reduced-motion (useReducedMotion) → сразу финальный текст, без прохода;
 *  - trigger: запуск по mount (по умолчанию) либо вручную через проп.
 */

import * as React from "react";

import { useReducedMotion } from "motion/react";

import { cn } from "@/shared/lib";

const DEFAULT_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!<>-_\\/[]{}—=+*^?#";

export interface TextScrambleProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  /** Финальный (целевой) текст */
  children: string;
  /** Длительность всего прохода, сек (≈ children.length тиков) */
  duration?: number;
  /** Интервал тика, сек */
  speed?: number;
  /** Набор символов для скрамбла */
  characterSet?: string;
  /** Запускать анимацию (on-mount по умолчанию). false → сразу финал */
  trigger?: boolean;
  /** Тег рендера */
  as?: React.ElementType;
}

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.03,
  characterSet = DEFAULT_CHARS,
  trigger = true,
  as: Tag = "span",
  className,
  ...props
}: TextScrambleProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayText, setDisplayText] = React.useState(children);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    // Reduced-motion или явно выключенный триггер — показываем финал сразу.
    if (prefersReducedMotion || !trigger) {
      setDisplayText(children);
      return;
    }

    const text = children;
    // Сколько тиков нужно «разрешить» каждый символ — равномерно по длине строки.
    const steps = Math.max(text.length, 1);
    const tickMs = Math.max(speed, 0.01) * 1000;
    // Сколько тиков займёт весь проход.
    const totalTicks = Math.max(Math.round(duration / Math.max(speed, 0.01)), steps);
    let tick = 0;

    const randomChar = () =>
      characterSet[Math.floor(Math.random() * characterSet.length)] ?? "";

    intervalRef.current = setInterval(() => {
      tick += 1;
      // Прогресс: какая доля символов уже «разрешена».
      const revealed = Math.floor((tick / totalTicks) * text.length);

      const next = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i < revealed) return char;
          return randomChar();
        })
        .join("");

      setDisplayText(next);

      if (tick >= totalTicks) {
        setDisplayText(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, tickMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [children, trigger, prefersReducedMotion, characterSet, duration, speed]);

  return (
    <Tag className={cn("inline-block", className)} aria-label={children} {...props}>
      <span aria-hidden>{displayText}</span>
    </Tag>
  );
}
