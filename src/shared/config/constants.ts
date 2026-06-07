/**
 * Общие константы приложения
 */

/** Размер страницы для таблиц с пагинацией (skip/limit) */
export const PAGE_SIZE = 20;

/** Таймаут HTTP-запросов axios, мс */
export const API_TIMEOUT_MS = 30_000;

/** Окно проактивного рефреша токена до истечения, мс */
export const TOKEN_REFRESH_WINDOW_MS = 60_000;

/** Фолбэк кулдауна повторной отправки письма верификации, сек */
export const EMAIL_RESEND_COOLDOWN_SEC = 300;

/** Дефолтный primary_color аватара (новый акцент light-techno) */
export const DEFAULT_AVATAR_COLOR = "#5BFF8F";
