"use client";

import { useState, useEffect, useRef, useCallback } from "react";

import { formatDuration } from "./formatters";

/** Публичный API хука {@link useCountdown}. */
export interface UseCountdownResult {
  /** Сколько секунд осталось (0, когда отсчёт завершён). */
  secondsLeft: number;
  /** `true`, пока `secondsLeft > 0`. */
  isActive: boolean;
  /** Оставшееся время в формате «mm:ss» (через {@link formatDuration}). */
  formatted: string;
  /** Запустить (или перезапустить) отсчёт с указанного числа секунд. */
  start: (seconds: number) => void;
  /** Немедленно остановить отсчёт и сбросить остаток в 0. */
  stop: () => void;
}

/**
 * Хук обратного отсчёта (cooldown/countdown) на `setInterval`.
 *
 * Раз в секунду уменьшает остаток на 1 и сам останавливается на нуле.
 * Заменяет дословно продублированную cooldown-логику email-верификации
 * (`verify-email`, `ResendVerificationButton`) и telegram-таймер настроек (T-13).
 *
 * @param initialSeconds С какого значения стартовать (по умолчанию `0` — неактивен).
 *
 * @example
 * const { secondsLeft, isActive, formatted, start } = useCountdown();
 * // ...
 * start(300); // «5:00» → «4:59» → ... → «0:00»
 */
export function useCountdown(initialSeconds = 0): UseCountdownResult {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback((seconds: number) => {
    setSecondsLeft(Math.max(0, Math.floor(seconds)));
  }, []);

  const stop = useCallback(() => {
    clear();
    setSecondsLeft(0);
  }, [clear]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return clear;
  }, [secondsLeft, clear]);

  return {
    secondsLeft,
    isActive: secondsLeft > 0,
    formatted: formatDuration(secondsLeft),
    start,
    stop,
  };
}
