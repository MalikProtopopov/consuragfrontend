/**
 * tokenStorage — единая точка чтения/записи/очистки auth-токенов (T-23).
 *
 * Проблема, которую решает модуль (security-критично):
 *   - access-токен хранится в localStorage (`auth_token`) — его читает axios;
 *   - middleware (Edge) читает токен ТОЛЬКО из non-httpOnly cookie `access_token`;
 *   - раньше cookie писалась лишь в `authApi` (login/refresh/logout), а интерсептор
 *     `apiClient` при собственном авто-рефреше обновлял только localStorage →
 *     cookie держала протухший токен → middleware видел старый/невалидный токен
 *     (в т.ч. устаревшую роль для admin-гейта).
 *
 * Решение: localStorage и cookie пишутся/чистятся ТОЛЬКО через этот модуль,
 * атомарно и с одинаковым сроком жизни. Любой путь рефреша (proactive,
 * reactive-401, явный authApi.refresh) синхронизирует оба хранилища.
 *
 * Cookie не httpOnly намеренно: refresh идёт телом запроса, токен доступен JS —
 * httpOnly без правок бэкенда невозможен (вариант «а» в плане, отложен).
 */

/** Ключи localStorage (исторические — менять нельзя без миграции у пользователей). */
const TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const EXPIRES_AT_KEY = "auth_expires_at";

/** Имя cookie, которую читает middleware. */
const ACCESS_TOKEN_COOKIE = "access_token";

/** Фолбэк max-age cookie, сек (30 мин) — если бэкенд не прислал expires_in. */
const DEFAULT_COOKIE_MAX_AGE_SEC = 1800;

/**
 * Записать/обновить cookie `access_token`.
 * Secure ставится только на https — иначе браузер на http://localhost
 * молча отбрасывает cookie с флагом Secure (ломает локальную разработку).
 */
function writeAccessTokenCookie(accessToken: string, maxAgeSec: number): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${accessToken}; path=/; max-age=${maxAgeSec}; SameSite=Lax${secure}`;
}

/** Удалить cookie `access_token` (max-age=0). Secure-флаг для удаления не важен. */
function clearAccessTokenCookie(): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

/**
 * Единое хранилище токенов: атомарно синхронизирует localStorage и cookie.
 */
export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getExpiresAt(): number | null {
    if (typeof window === "undefined") return null;
    const expiresAt = localStorage.getItem(EXPIRES_AT_KEY);
    return expiresAt ? Number(expiresAt) : null;
  },

  /**
   * Записать токены в localStorage И синхронно обновить cookie `access_token`.
   * cookie max-age = expires_in (если задан), иначе дефолт 30 мин — как раньше.
   */
  setTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    if (expiresIn) {
      const expiresAt = Date.now() + expiresIn * 1000;
      localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
    }
    // Синхронно обновляем cookie тем же значением — чинит рассинхрон при авто-рефреше.
    writeAccessTokenCookie(accessToken, expiresIn || DEFAULT_COOKIE_MAX_AGE_SEC);
  },

  /** Очистить ОБА хранилища (localStorage + cookie). */
  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    clearAccessTokenCookie();
  },

  hasToken(): boolean {
    return !!tokenStorage.getAccessToken();
  },
};
