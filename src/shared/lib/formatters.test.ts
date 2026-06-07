import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  formatBytes,
  formatCompact,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDuration,
  formatDurationMs,
  formatNumber,
  formatRelativeTime,
  formatTime,
} from "./formatters";

// Фиксированная дата для детерминированных дат/времён: 7 июня 2026, 14:30:05 UTC.
const FIXED = new Date("2026-06-07T14:30:05Z");

describe("formatDate", () => {
  it("«long» — длинный месяц с годом", () => {
    expect(formatDate("2026-06-07", "long")).toContain("2026");
    expect(formatDate("2026-06-07", "long")).toContain("июн");
  });

  it("по умолчанию использует стиль long", () => {
    expect(formatDate("2026-06-07")).toBe(formatDate("2026-06-07", "long"));
  });

  it("«short» — числовой формат dd.mm.yyyy", () => {
    expect(formatDate("2026-06-07", "short")).toBe("07.06.2026");
  });

  it("«datetime» содержит дату и время", () => {
    const out = formatDate(FIXED, "datetime");
    expect(out).toContain("2026");
    expect(out).toMatch(/\d{2}:\d{2}/);
  });

  it("«datetime-seconds» содержит секунды", () => {
    const out = formatDate(FIXED, "datetime-seconds");
    expect(out).toMatch(/\d{2}:\d{2}:\d{2}/);
  });

  it("«day-month» — только день и короткий месяц", () => {
    const out = formatDate("2026-06-07", "day-month");
    expect(out).toContain("июн");
    expect(out).not.toContain("2026");
  });

  it("все стили рендерятся без ошибок", () => {
    const styles = [
      "long",
      "short",
      "datetime",
      "datetime-long",
      "datetime-compact",
      "datetime-numeric",
      "datetime-short",
      "datetime-seconds",
      "day-month",
    ] as const;
    for (const s of styles) {
      expect(typeof formatDate(FIXED, s)).toBe("string");
      expect(formatDate(FIXED, s).length).toBeGreaterThan(0);
    }
  });

  it("null/undefined/пустая строка → fallback по умолчанию «—»", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
  });

  it("кастомный fallback", () => {
    expect(formatDate(null, "short", "")).toBe("");
    expect(formatDate(undefined, "long", "нет данных")).toBe("нет данных");
  });

  it("невалидная дата → fallback", () => {
    expect(formatDate("не-дата", "short", "bad")).toBe("bad");
  });

  it("принимает Date и timestamp", () => {
    expect(formatDate(FIXED, "short")).toBe("07.06.2026");
    expect(formatDate(FIXED.getTime(), "short")).toBe("07.06.2026");
  });
});

describe("formatDateTime", () => {
  it("алиас formatDate(date, datetime)", () => {
    expect(formatDateTime(FIXED)).toBe(formatDate(FIXED, "datetime"));
  });

  it("fallback для null", () => {
    expect(formatDateTime(null, "x")).toBe("x");
  });
});

describe("formatTime", () => {
  it("часы:минуты", () => {
    expect(formatTime(FIXED)).toMatch(/^\d{2}:\d{2}$/);
  });

  it("fallback для null", () => {
    expect(formatTime(null)).toBe("—");
  });
});

describe("formatRelativeTime", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-07T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("«только что» (< 1 мин)", () => {
    expect(formatRelativeTime(new Date("2026-06-07T11:59:40Z"))).toBe("только что");
  });

  it("минуты назад", () => {
    expect(formatRelativeTime(new Date("2026-06-07T11:55:00Z"))).toBe("5 мин. назад");
  });

  it("часы назад", () => {
    expect(formatRelativeTime(new Date("2026-06-07T10:00:00Z"))).toBe("2 ч. назад");
  });

  it("«вчера»", () => {
    expect(formatRelativeTime(new Date("2026-06-06T11:00:00Z"))).toBe("вчера");
  });

  it("дни назад (< 7)", () => {
    expect(formatRelativeTime(new Date("2026-06-04T11:00:00Z"))).toBe("3 дн. назад");
  });

  it("давние даты (≥ 7 дней) → короткая дата", () => {
    const out = formatRelativeTime(new Date("2026-05-01T11:00:00Z"));
    expect(out).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });

  it("fallback для null", () => {
    expect(formatRelativeTime(null)).toBe("—");
  });
});

describe("formatCurrency", () => {
  it("USD по умолчанию, два знака", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("ноль", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("кастомная валюта", () => {
    expect(formatCurrency(10, "EUR")).toContain("10.00");
  });
});

describe("formatCompact", () => {
  it("< 1000 — как есть", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(999)).toBe("999");
  });

  it("граница тысяч — округление до K", () => {
    expect(formatCompact(1000)).toBe("1K");
    expect(formatCompact(1500)).toBe("2K");
    expect(formatCompact(999_999)).toBe("1000K");
  });

  it("граница миллионов — один знак M", () => {
    expect(formatCompact(1_000_000)).toBe("1.0M");
    expect(formatCompact(1_500_000)).toBe("1.5M");
  });
});

describe("formatNumber", () => {
  it("разделители разрядов ru-RU", () => {
    // ru-RU использует неразрывный пробел как разделитель тысяч.
    expect(formatNumber(1234567)).toMatch(/1\s234\s567/u);
  });

  it("малые числа без разделителей", () => {
    expect(formatNumber(42)).toBe("42");
  });
});

describe("formatBytes", () => {
  it("байты", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("граница KB", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });

  it("граница MB", () => {
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
    expect(formatBytes(3.2 * 1024 * 1024)).toBe("3.2 MB");
  });
});

describe("formatDurationMs", () => {
  it("null/undefined → «—»", () => {
    expect(formatDurationMs(null)).toBe("—");
    expect(formatDurationMs(undefined)).toBe("—");
  });

  it("миллисекунды (< 1000)", () => {
    expect(formatDurationMs(0)).toBe("0ms");
    expect(formatDurationMs(850)).toBe("850ms");
  });

  it("секунды (≥ 1000)", () => {
    expect(formatDurationMs(1000)).toBe("1.0s");
    expect(formatDurationMs(1500)).toBe("1.5s");
  });
});

describe("formatDuration (mm:ss)", () => {
  it("базовый формат с дополнением нулём", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(300)).toBe("5:00");
  });

  it("отрицательные клампятся в 0", () => {
    expect(formatDuration(-10)).toBe("0:00");
  });

  it("дробные секунды округляются вниз", () => {
    expect(formatDuration(65.9)).toBe("1:05");
  });
});
