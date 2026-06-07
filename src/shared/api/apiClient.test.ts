/**
 * Тесты на ЧИСТЫЕ, тестируемые без сети куски `apiClient`:
 *   - `ApiError` — трансформация ответа бэкенда в типизированную ошибку;
 *   - `onTokenLimitError` — pub/sub подписки на token-limit события.
 *
 * СЛЕДУЮЩИЙ ШАГ С MSW (отложено): refresh-флоу (proactive + reactive 401),
 * очередь `failedQueue`, ретрай оригинального запроса и эмит token-limit из
 * интерсептора. Эта логика завязана на axios-инстанс и сеть — для неё в
 * `src/test/{handlers,server}.ts` заведены заготовки MSW; хрупкие моки axios
 * здесь намеренно не пишем.
 */
import { describe, expect, it, vi } from "vitest";

import { ApiError, type ApiErrorResponse, onTokenLimitError } from "./apiClient";

describe("ApiError", () => {
  it("извлекает code/message/status из ответа бэкенда", () => {
    const response: ApiErrorResponse = {
      error: { code: "NOT_FOUND", message: "Проект не найден" },
    };
    const err = new ApiError(response, 404);

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("ApiError");
    expect(err.message).toBe("Проект не найден");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.status).toBe(404);
    expect(err.field).toBeUndefined();
    expect(err.details).toBeUndefined();
  });

  it("пробрасывает field и details, когда они есть", () => {
    const response: ApiErrorResponse = {
      error: {
        code: "VALIDATION_ERROR",
        message: "Некорректные данные",
        field: "email",
        details: { reason: "invalid", attempts: 3 },
      },
    };
    const err = new ApiError(response, 422);

    expect(err.field).toBe("email");
    expect(err.details).toEqual({ reason: "invalid", attempts: 3 });
    expect(err.status).toBe(422);
  });

  it("ловится как обычная Error в try/catch", () => {
    try {
      throw new ApiError({ error: { code: "X", message: "boom" } }, 500);
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).code).toBe("X");
    }
  });
});

describe("onTokenLimitError", () => {
  it("возвращает функцию отписки", () => {
    const unsubscribe = onTokenLimitError(() => {});
    expect(typeof unsubscribe).toBe("function");
    unsubscribe();
  });

  it("повторная подписка/отписка одного обработчика безопасна", () => {
    const handler = vi.fn();
    const unsub = onTokenLimitError(handler);
    unsub();
    // повторная отписка не бросает
    expect(() => unsub()).not.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });
});
