"use client";

/**
 * Terminal
 * Адаптация magicui Terminal (dillionverma) на пакет `motion`.
 * Источник: https://21st.dev/r/magicui/terminal (magicui.design).
 *
 * Светлое окно-«терминал» под mono-айдентику: шапка с тремя muted-точками
 * (наш стиль, не маковский светофор) + mono-заголовок; тело — последовательно
 * появляющиеся строки.
 *
 * Отличия от оригинала (адаптация под наши токены, BRAND_POLISH_PLAN T-B.5):
 *  - светлая тема: bg-bg-secondary, бордер var(--border), текст mono;
 *  - точки шапки — muted (var(--border)), без красно-жёлто-зелёного;
 *  - prefers-reduced-motion → весь текст появляется сразу, без печати/задержек.
 */

import * as React from "react";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/shared/lib";

/* ---------------- TypingAnimation: печатает строку по символу ---------------- */

export interface TypingAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: string;
  /** Задержка перед стартом печати, мс */
  delay?: number;
  /** Скорость печати, мс/символ */
  duration?: number;
  as?: React.ElementType;
}

export function TypingAnimation({
  children,
  delay = 0,
  duration = 30,
  as: Tag = "span",
  className,
  ...props
}: TypingAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = React.useState(prefersReducedMotion ? children : "");
  const [started, setStarted] = React.useState(prefersReducedMotion);

  React.useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(children);
      return;
    }
    const startTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay, prefersReducedMotion, children]);

  React.useEffect(() => {
    if (prefersReducedMotion || !started) return;
    let i = 0;
    setDisplayed("");
    const typing = setInterval(() => {
      if (i < children.length) {
        setDisplayed(children.slice(0, i + 1));
        i += 1;
      } else {
        clearInterval(typing);
      }
    }, duration);
    return () => clearInterval(typing);
  }, [children, duration, started, prefersReducedMotion]);

  return (
    <Tag className={cn("inline", className)} {...props}>
      {displayed}
    </Tag>
  );
}

/* ---------------- AnimatedSpan: мгновенный вывод с fade-in ---------------- */

export interface AnimatedSpanProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Задержка появления, мс */
  delay?: number;
}

export function AnimatedSpan({ children, delay = 0, className }: AnimatedSpanProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={cn("grid text-sm font-mono", className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.25, delay: delay / 1000 }}
      className={cn("grid text-sm font-mono", className)}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Terminal: окно-обёртка ---------------- */

export interface TerminalProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Заголовок в шапке (mono) */
  title?: string;
}

export function Terminal({ title = "avatar — bash", children, className, ...props }: TerminalProps) {
  return (
    <div
      className={cn(
        "z-0 w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-bg-secondary shadow-sm",
        className,
      )}
      {...props}
    >
      {/* Шапка: три muted-точки + mono-заголовок */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </div>
        <span className="ml-2 truncate font-mono text-xs text-text-muted">{title}</span>
      </div>

      {/* Тело */}
      <div className="grid gap-1 p-4 text-text-primary">
        <code className="grid gap-1 font-mono text-sm leading-relaxed">{children}</code>
      </div>
    </div>
  );
}
