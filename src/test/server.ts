import { setupServer } from "msw/node";

import { handlers } from "./handlers";

/**
 * MSW-сервер для node-окружения (vitest).
 *
 * Заготовка для сетевых тестов `apiClient`. Подключать в тест-файле так:
 *
 *   import { beforeAll, afterEach, afterAll } from "vitest";
 *   import { server } from "@/test/server";
 *
 *   beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
export const server = setupServer(...handlers);
