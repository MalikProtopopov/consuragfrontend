/**
 * Очищает токен бота от невидимых символов и пробелов.
 * Telegram-токены при копировании часто содержат zero-width/non-breaking пробелы.
 */
export function cleanToken(token: string): string {
  return token
    .trim()
    .replace(/[​-‍﻿ ]/g, "") // zero-width и неразрывные пробелы
    .replace(/\s/g, ""); // любые оставшиеся пробелы
}
