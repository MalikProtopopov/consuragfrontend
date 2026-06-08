"use client";

import { useEffect, useRef } from "react";

import { apiUrlManager } from "./apiUrlManager";
import { tokenStorage } from "./tokenStorage";

export interface RealtimeMessage {
  type: string;
  channel?: string;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

/** Служебные типы сообщений сервера, не несущие доменных событий. */
const CONTROL_TYPES = new Set([
  "ready",
  "ping",
  "pong",
  "subscribed",
  "unsubscribed",
]);

function realtimeWsUrl(): string {
  // https://api… → wss://api…/api/v1/ws (http → ws для локалки).
  const base = apiUrlManager.getApiUrl().replace(/^http(s?):\/\//, (_m, s) =>
    s ? "wss://" : "ws://"
  );
  return `${base.replace(/\/$/, "")}/api/v1/ws`;
}

/**
 * Подписка на один realtime-канал `WS /api/v1/ws` (см. docs/REALTIME_WEBSOCKETS.md).
 * Авторизация — `{op:auth}` access-токеном (не в URL), затем `subscribe`.
 * Реконнект с экспоненциальным backoff. `onEvent` вызывается только для доменных
 * событий (control-сообщения отфильтрованы). WS — это push поверх REST: при
 * получении события компонент сам решает, что обновить (обычно invalidateQueries).
 *
 * Передайте `channel = null`, чтобы не подключаться (напр. пока не загрузились id).
 */
export function useRealtimeChannel(
  channel: string | null | undefined,
  onEvent: (msg: RealtimeMessage) => void
): void {
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!channel) return;
    if (typeof window === "undefined") return;
    if (!tokenStorage.getAccessToken()) return;

    let ws: WebSocket | null = null;
    let stopped = false;
    let retry = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (stopped) return;
      const token = tokenStorage.getAccessToken();
      if (!token) return;

      try {
        ws = new WebSocket(realtimeWsUrl());
      } catch {
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        ws?.send(JSON.stringify({ op: "auth", token }));
      };

      ws.onmessage = (event) => {
        let msg: RealtimeMessage;
        try {
          msg = JSON.parse(event.data as string);
        } catch {
          return;
        }

        if (msg.type === "ready") {
          retry = 0;
          ws?.send(JSON.stringify({ op: "subscribe", channel }));
          return;
        }
        // FORBIDDEN / UNAUTHORIZED и т.п. — тихо останавливаемся (REST продолжит работать).
        if (msg.type === "error") {
          stopped = true;
          try {
            ws?.close();
          } catch {
            /* noop */
          }
          return;
        }
        if (CONTROL_TYPES.has(msg.type)) return;

        onEventRef.current(msg);
      };

      ws.onclose = () => {
        if (stopped) return;
        scheduleReconnect();
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          /* onclose выполнит реконнект */
        }
      };
    };

    const scheduleReconnect = () => {
      if (stopped) return;
      const delay = Math.min(1000 * 2 ** retry, 15000);
      retry += 1;
      reconnectTimer = setTimeout(connect, delay);
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        ws?.close();
      } catch {
        /* noop */
      }
    };
  }, [channel]);
}
