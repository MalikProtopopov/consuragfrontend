/**
 * Тесты tokenStorage (T-23): атомарная синхронизация localStorage ↔ cookie.
 *
 * jsdom по умолчанию работает на http://localhost — поэтому Secure-флаг НЕ
 * ставится, и cookie реально доступна через document.cookie (что и проверяем).
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { tokenStorage } from "./tokenStorage";

/** Прочитать значение cookie по имени из document.cookie. */
function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return match.slice(name.length + 1);
}

/** Сбросить cookie access_token между тестами (jsdom её не чистит сам). */
function clearAccessTokenCookie(): void {
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
}

describe("tokenStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAccessTokenCookie();
  });

  afterEach(() => {
    clearAccessTokenCookie();
  });

  it("setTokens пишет access/refresh/expiresAt в localStorage", () => {
    tokenStorage.setTokens("access-1", "refresh-1", 1800);

    expect(tokenStorage.getAccessToken()).toBe("access-1");
    expect(tokenStorage.getRefreshToken()).toBe("refresh-1");

    const expiresAt = tokenStorage.getExpiresAt();
    expect(expiresAt).not.toBeNull();
    // expiresAt ≈ now + 1800s
    expect(expiresAt!).toBeGreaterThan(Date.now());
  });

  it("setTokens синхронно пишет cookie access_token тем же значением", () => {
    tokenStorage.setTokens("access-cookie", "refresh-1", 1800);
    expect(readCookie("access_token")).toBe("access-cookie");
  });

  it("setTokens без refreshToken не затирает существующий refresh", () => {
    tokenStorage.setTokens("access-1", "refresh-1", 1800);
    // авто-рефреш может прислать только access — refresh должен сохраниться
    tokenStorage.setTokens("access-2", undefined, 1800);

    expect(tokenStorage.getAccessToken()).toBe("access-2");
    expect(tokenStorage.getRefreshToken()).toBe("refresh-1");
  });

  it("повторный setTokens обновляет и localStorage, и cookie (фикс рассинхрона)", () => {
    tokenStorage.setTokens("old", "refresh-1", 1800);
    expect(readCookie("access_token")).toBe("old");

    // имитируем авто-рефреш интерсептора
    tokenStorage.setTokens("fresh", "refresh-2", 1800);

    expect(tokenStorage.getAccessToken()).toBe("fresh");
    expect(readCookie("access_token")).toBe("fresh");
  });

  it("clearTokens чистит и localStorage, и cookie", () => {
    tokenStorage.setTokens("access-1", "refresh-1", 1800);
    expect(tokenStorage.hasToken()).toBe(true);
    expect(readCookie("access_token")).toBe("access-1");

    tokenStorage.clearTokens();

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
    expect(tokenStorage.getExpiresAt()).toBeNull();
    expect(tokenStorage.hasToken()).toBe(false);
    expect(readCookie("access_token")).toBeNull();
  });

  it("hasToken отражает наличие access-токена", () => {
    expect(tokenStorage.hasToken()).toBe(false);
    tokenStorage.setTokens("t", "r", 60);
    expect(tokenStorage.hasToken()).toBe(true);
  });

  it("на http (jsdom) cookie пишется без Secure — иначе браузер её отбросит", () => {
    tokenStorage.setTokens("no-secure", "r", 60);
    // если бы Secure стоял на http, jsdom бы cookie не сохранил и readCookie дал бы null
    expect(readCookie("access_token")).toBe("no-secure");
  });
});
