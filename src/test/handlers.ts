import { http, HttpResponse } from "msw";

/**
 * MSW request handlers — заготовка для будущих тестов сетевого слоя.
 *
 * Здесь будут моки эндпоинтов бэкенда для тестов `apiClient` (refresh-флоу,
 * очередь `failedQueue`, реактивный 401-ретрай). Сейчас пусто намеренно:
 * сетевые тесты apiClient отложены (см. шапку `src/shared/api/apiClient.test.ts`).
 *
 * Пример будущего хендлера:
 *   http.post("*\/api/v1/auth/refresh", () =>
 *     HttpResponse.json({ access_token: "new", refresh_token: "r", expires_in: 3600 })
 *   )
 */
export const handlers = [
  // Заглушка, чтобы массив был непустым и типы http/HttpResponse использовались.
  http.get("*/api/v1/__msw_health__", () => HttpResponse.json({ ok: true })),
];
