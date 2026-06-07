import { EMAIL_RESEND_COOLDOWN_SEC } from "@/shared/config";

/** Форма ошибки API с кодом и деталями (cooldown повторной отправки письма). */
export interface ApiErrorWithDetails {
  error?: {
    code?: string;
    details?: {
      wait_seconds?: number;
    };
  };
  code?: string;
}

/** Код ошибки бэкенда: повторная отправка письма ещё на cooldown. */
export const AUTH_EMAIL_RESEND_COOLDOWN = "AUTH_EMAIL_RESEND_COOLDOWN";

/**
 * Если ошибка — это cooldown повторной отправки письма
 * (`AUTH_EMAIL_RESEND_COOLDOWN`), возвращает сколько секунд ждать
 * (`details.wait_seconds`, иначе дефолт {@link EMAIL_RESEND_COOLDOWN_SEC}).
 * Для прочих ошибок возвращает `null`.
 *
 * Общий помощник для `verify-email` и `ResendVerificationButton` (T-13).
 */
export function getResendCooldownSeconds(error: unknown): number | null {
  const apiError = error as ApiErrorWithDetails;
  if (apiError.error?.code !== AUTH_EMAIL_RESEND_COOLDOWN) return null;
  return apiError.error.details?.wait_seconds || EMAIL_RESEND_COOLDOWN_SEC;
}
