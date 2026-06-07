"use client";

/**
 * AIInput
 * Адаптация kokonutd AI Input на пакет `motion`.
 * Источник: https://21st.dev/r/kokonutd/ai-input (kokonutui.com).
 *
 * Лёгкий чат-инпут под mono/терминальную айдентику (BRAND_POLISH_PLAN T-B.10,
 * лёгкий вариант): auto-resize textarea с prompt-глифом `>` и анимированной
 * кнопкой отправки на кислотном градиенте, которая «оживает» при наборе текста.
 *
 * Контролируемый компонент (value/onChange/onSubmit) — состояние держит вызывающий.
 * Enter — отправка, Shift+Enter — перенос строки.
 *
 * Отличия от оригинала (адаптация под наши токены):
 *  - цвета только через CSS-переменные (gradient-primary, border, ring);
 *  - prompt-глиф `>` в primary-link — рифма с бренд-знаком `>_`;
 *  - prefers-reduced-motion → кнопка без scale/fade-анимации.
 */

import * as React from "react";

import { motion, useReducedMotion } from "motion/react";
import { Send } from "lucide-react";

import { cn } from "@/shared/lib";

import { Spinner } from "./spinner";

export interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Вызывается по Enter (без Shift) или клику на кнопку, если есть непустой текст */
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  /** Идёт отправка — кнопка показывает спиннер, ввод заблокирован */
  isSending?: boolean;
  /** Минимальная высота поля, px */
  minHeight?: number;
  /** Максимальная высота поля перед скроллом, px */
  maxHeight?: number;
  className?: string;
}

export const AIInput = React.forwardRef<HTMLTextAreaElement, AIInputProps>(
  (
    {
      value,
      onChange,
      onSubmit,
      placeholder = "Введите сообщение…",
      disabled = false,
      isSending = false,
      minHeight = 24,
      maxHeight = 180,
      className,
    },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const innerRef = React.useRef<HTMLTextAreaElement>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const canSend = value.trim().length > 0 && !disabled && !isSending;

    // Auto-resize: высота поля по содержимому, но не больше maxHeight
    React.useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, [value, maxHeight]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (canSend) onSubmit();
      }
    };

    return (
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border border-border bg-bg-secondary px-3 py-2.5",
          "transition-colors focus-within:border-primary-ring focus-within:ring-[3px] focus-within:ring-primary-ring/20",
          disabled && "opacity-60",
          className,
        )}
      >
        <span
          aria-hidden
          className="select-none pb-px font-mono text-sm font-semibold text-primary-link"
        >
          {">"}
        </span>

        <textarea
          ref={innerRef}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isSending}
          style={{ minHeight }}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm leading-6 text-text-primary outline-none",
            "placeholder:text-text-muted disabled:cursor-not-allowed",
          )}
        />

        <motion.button
          type="button"
          onClick={() => canSend && onSubmit()}
          disabled={!canSend}
          aria-label="Отправить"
          initial={false}
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: canSend ? 1 : 0.85, opacity: canSend ? 1 : 0.5 }
          }
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg text-primary-foreground",
            "bg-gradient-primary disabled:cursor-not-allowed",
          )}
        >
          {isSending ? (
            <Spinner size="sm" className="text-primary-foreground" />
          ) : (
            <Send className="size-4" />
          )}
        </motion.button>
      </div>
    );
  },
);

AIInput.displayName = "AIInput";
