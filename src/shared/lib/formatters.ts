/**
 * Единый набор форматтеров для всего проекта.
 *
 * Цель — устранить дубли локальных `function formatX` по страницам и
 * shared/ui-компонентам, сохранив при этом ВИДИМЫЙ формат каждого call-site.
 * Там, где у дублей отличались опции локали, поведение параметризовано через
 * `style`, а не изменено молча.
 *
 * Локаль дат — `ru-RU`, локаль валюты — `en-US` (как в исходных дублях).
 */

/** Значение, из которого можно получить дату: ISO-строка, Date или null/undefined. */
type DateInput = string | number | Date | null | undefined;

/** Стиль форматирования даты. */
export type DateStyle =
  /** Дата без времени, длинный месяц: «7 июня 2026 г.» */
  | "long"
  /** Дата без времени, короткий числовой формат: «07.06.2026» */
  | "short"
  /** Дата + время, короткий месяц: «07 июн. 2026 г., 14:30» */
  | "datetime"
  /** Дата + время, длинный месяц: «7 июня 2026 г., 14:30» */
  | "datetime-long"
  /** Компактные дата и время, числовой месяц без года: «07.06, 14:30» */
  | "datetime-compact"
  /** Дата + время, числовой месяц и полный год: «07.06.2026, 14:30» */
  | "datetime-numeric"
  /** Дата + время, двузначный год: «07.06.26, 14:30» */
  | "datetime-short"
  /** Дата + время + секунды, двузначный год: «07.06.26, 14:30:05» */
  | "datetime-seconds"
  /** Только день и короткий месяц (для осей графиков): «7 июн.» */
  | "day-month";

const RU_LOCALE = "ru-RU";

const DATE_STYLE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  long: { day: "numeric", month: "long", year: "numeric" },
  short: { day: "2-digit", month: "2-digit", year: "numeric" },
  datetime: {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  "datetime-long": {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  "datetime-compact": {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
  "datetime-numeric": {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  "datetime-short": {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  },
  "datetime-seconds": {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  },
  "day-month": { day: "numeric", month: "short" },
};

/**
 * Форматирует дату в локали `ru-RU` в одном из предопределённых стилей.
 *
 * @param date  ISO-строка, timestamp, Date или null/undefined.
 * @param style Стиль вывода (по умолчанию `"long"`).
 * @param fallback Что вернуть для пустого/невалидного значения (по умолчанию `"—"`).
 *
 * @example formatDate("2026-06-07")                  // «7 июня 2026 г.»
 * @example formatDate(d, "datetime")                 // «07 июн. 2026 г., 14:30»
 * @example formatDate(null, "short", "")             // ""
 */
export function formatDate(date: DateInput, style: DateStyle = "long", fallback = "—"): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleString(RU_LOCALE, DATE_STYLE_OPTIONS[style]);
}

/**
 * Форматирует дату со временем (короткий месяц): «07 июн. 2026 г., 14:30».
 * Алиас `formatDate(date, "datetime")`.
 */
export function formatDateTime(date: DateInput, fallback = "—"): string {
  return formatDate(date, "datetime", fallback);
}

/**
 * Форматирует только время (часы:минуты) в локали `ru-RU`: «14:30».
 */
export function formatTime(date: DateInput, fallback = "—"): string {
  const d = toDate(date);
  if (!d) return fallback;
  return d.toLocaleTimeString(RU_LOCALE, { hour: "2-digit", minute: "2-digit" });
}

/**
 * Человекочитаемое относительное время на русском: «только что», «5 мин. назад»,
 * «2 ч. назад», «вчера», «3 дн. назад». Для давних дат (≥ 7 дней) возвращает
 * короткую дату `dd.mm.yyyy` (`toLocaleDateString("ru-RU")`).
 */
export function formatRelativeTime(date: DateInput, fallback = "—"): string {
  const d = toDate(date);
  if (!d) return fallback;

  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return `${diffMins} мин. назад`;
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays === 1) return "вчера";
  if (diffDays < 7) return `${diffDays} дн. назад`;
  return d.toLocaleDateString(RU_LOCALE);
}

/**
 * Форматирует денежную сумму. По умолчанию USD в локали `en-US`
 * с двумя знаками после запятой: «$1,234.50».
 *
 * @param value    Сумма.
 * @param currency Код валюты ISO-4217 (по умолчанию `"USD"`).
 */
export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Компактное представление числа с сокращениями K/M:
 * «999» → «999», «1500» → «2K», «1 500 000» → «1.5M».
 *
 * Объединяет прежние `formatCompact` / `formatTokens` / `formatTokenValue`.
 * Для тысяч используется округление до целого (`2K`), для миллионов — один знак (`1.5M`).
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }
  return value.toString();
}

/**
 * Форматирует число с разделителями разрядов в локали `ru-RU`:
 * «1234567» → «1 234 567». Замена для россыпи inline `value.toLocaleString()`.
 */
export function formatNumber(value: number): string {
  return value.toLocaleString(RU_LOCALE);
}

/**
 * Форматирует размер в байтах: «512 B», «1.5 KB», «3.2 MB».
 * Замена для дублей `formatFileSize`.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Форматирует длительность в миллисекундах: «—» для null, «850ms», «1.5s».
 * Замена для `formatResponseTime`.
 */
export function formatDurationMs(ms: number | null | undefined): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Преобразует длительность в секундах в формат «mm:ss»: 65 → «1:05».
 * Для cooldown/countdown (T-13).
 */
export function formatDuration(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/** Безопасно превращает вход в валидный Date или null. */
function toDate(input: DateInput): Date | null {
  if (input === null || input === undefined || input === "") return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}
