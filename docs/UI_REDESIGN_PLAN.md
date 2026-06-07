# План редизайна UI-кита

> Светлая «techno»-тема: белый фон, чёрный текст, программистская типографика
> (моно-заголовки + гротеск-текст), кислотно-зелёный градиентный primary,
> бордовый вторичный акцент. Тёмная тема и переключатель удаляются полностью.
>
> **База этого плана — `main` ПОСЛЕ мержа `feature/redesign-f0` (07.06.2026).**
> Промежуточный редизайн «F0 Editorial Light» УЖЕ выполнен (см.
> `docs/F0_DESIGN_SYSTEM_DOCUMENTATION.md`): светлая тема — дефолт, акцент розовый
> `#FF006E`/маджента, заголовки — серифные (Playfair Display). Утверждённая спека
> ниже **ЗАМЕНЯЕТ** F0-стиль: розовая палитра, Playfair и градиентный текст —
> выбрасываются; light-токены и плоские тени F0 — частично переиспользуются как
> отправная точка.
>
> Этот документ — отдельный трек от `docs/REFACTORING_PLAN.md`. Раздел координации
> (в конце) — **заглушка с вопросами для сверки** (REFACTORING_PLAN прямо сейчас
> перезаписывается параллельным агентом, поэтому не вычитывался).
>
> Все факты о коде перепроверены grep'ом/чтением по ТЕКУЩЕМУ состоянию (раздел 0).
> Контраст всех пар посчитан по WCAG 2.1 (relative luminance, sRGB).

---

## 0. Сверка «Текущего состояния» с реальным кодом (база ПОСЛЕ F0, проверено)

| Утверждение промпта | Результат проверки по текущему коду |
|---|---|
| `globals.css` — Tailwind v4 `@theme inline`, двойная система имён, **light уже дефолт** (`:root, .light`), `.dark` — opt-in, акцент розовый `#FF006E` | **Подтверждено.** Файл **650 строк** (не 660). `:root, .light` — стр. 142-230 (дефолт), `.dark` — стр. 235-322 (opt-in). `--accent-primary: #FF006E`, `--primary: #FF006E`, `--ring: #FF006E` в обеих темах. `@custom-variant dark` — стр. 4. |
| Шрифты: Playfair (`--font-heading`, cyrillic ✓) + Inter (`--font-sans`, cyrillic ✓) + JBM (`--font-mono`, **latin-only**) через next/font И повторно через `@font-face` gstatic | **Подтверждено.** `layout.tsx:2,11-28`: Playfair (`subsets:["latin","cyrillic"]`, `variable:"--font-heading"`), Inter (`["latin","cyrillic"]`, `--font-sans`), JBM (`subsets:["latin"]` — **только latin**, `--font-mono`). Дубль `@font-face` (Playfair+Inter+JBM gstatic) — `globals.css:15-42`. `@theme inline` объявляет `--font-heading` (стр. 52-53). |
| `font-heading`/Playfair используются в коде | **Только определение.** `grep font-heading src/**/*.tsx` → лишь `layout.tsx:14` (variable). В `globals.css` — `@font-face`, `@theme`, и правило `h1..h6, .font-heading { font-family: var(--font-heading); }` (стр. 355-358). **Ни один tsx не вешает класс `font-heading`** → удаление чистое (заголовки переедут на mono через правило h1–h6). |
| next-themes в 5 файлах | **Подтверждено: 5.** `providers/ThemeProvider.tsx` (обёртка `NextThemesProvider attribute="class" defaultTheme="light" enableSystem`), `shared/ui/sonner.tsx` (`useTheme`), `widgets/app-shell/ui/app-shell.tsx` (`useTheme`+toggle), `app/page.tsx` (toggle), `app/design-system/page.tsx` (toggle). Импорт провайдера также в `layout.tsx`/`providers/index.ts`. |
| 17–18 вхождений `dark:` в `*.tsx` | **Подтверждено: ровно 18** (F0 добавил `dark:` в `card.tsx`). Пофайльно: `badge.tsx` (5: `*-subtle`), `switch.tsx` (2), `input.tsx` (2), `card.tsx` (1: `dark:shadow-[...]`), `tabs.tsx` (1), `radio-group.tsx` (1), `toggle.tsx` (1), `select.tsx` (1), `checkbox.tsx` (1), `textarea.tsx` (1), `dropdown-menu.tsx` (1), `projects/[id]/avatars/[avatarId]/chat/page.tsx` (1). |
| 19–20 хардкод-hex в tsx | **Уточнено: 19 реальных + 1 в комментарии.** `usage-chart.tsx` (6: `#4ade80`×3, `#60a5fa`×3 — в `<stop stopColor>` и `<Area stroke>`), `avatars/[avatarId]/page.tsx` (3: `#ffcd33`), `avatars/new/page.tsx` (4: `#ffcd33`), `conversations/[conversationId]/page.tsx` (2: `#0088cc`), `integrations/telegram/page.tsx` (2: `#0088cc`), `integrations/telegram/sessions/[sessionId]/page.tsx` (2: `#0088cc`). **Плюс** `button.tsx:14` — `#FF006E` в **комментарии** (не код; устарел после редизайна — поправить заодно). |
| ~8 прямых tailwind-цветов | **Уточнено: 12 (F0 добавил `limit-alert`).** `conversations/[conversationId]/page.tsx` (4: `amber-500`×2, `green-500`, `red-500`), `plan-badge.tsx` (5: `zinc/blue/emerald/violet/amber-500`), `limit-alert.tsx` (3: `orange-500` ×3 — bg/border/icon). |
| 54 компонента в `shared/ui` | **55 `.tsx`-файлов** включая `index.ts` → **54 компонента**. Подтверждено (`ls` = 55 строк). |
| `design-system/page.tsx` 790 строк | **Подтверждено: 790.** Имеет собственный theme-toggle (`useTheme`, стр. 103/109/157). |
| Лендинг `page.tsx` 416 строк | **Изменилось: теперь 265 строк** (F0 переписал лендинг). Имеет свой theme-toggle (`useTheme`, стр. 38/50/124). |
| Theme-toggle в `app-shell`, не в `sidebar` | **Подтверждено + уточнено:** кнопка-переключатель (`Moon`/`Sun`) физически в **`widgets/app-shell/ui/header.tsx`** (стр. 121-125, пропсы `onThemeToggle`/`isDark`), а `app-shell.tsx` лишь вычисляет `toggleTheme`/`isDark` и прокидывает в `<Header>`. `sidebar.tsx` (**529 строк**, не 531) toggle темы НЕ содержит. |
| `tw-animate-css` подключён, motion-токены есть | **Подтверждено** (`globals.css:2`; `--duration-fast/medium/slow`, `--ease-standard/emphasized` стр. 132-136). Есть `.skeleton-shimmer` + `@keyframes shimmer` (стр. 540-547, 617-621). |
| `.text-gradient` utility | **Подтверждено** (`globals.css:461-463`: `from-primary to-accent-primary bg-gradient-to-r bg-clip-text text-transparent`). **В tsx нигде не используется** (`grep text-gradient` = 0) → перенаправить на новый градиент либо удалить без риска. |
| **Дополнительно (важно):** `components.json` → `aliases.ui = "@/components/ui"`, а не `@/shared/ui` | **Подтверждено** (`style:"new-york"`, `utils:"@/lib/utils"`, `ui:"@/components/ui"`). `npx shadcn add` положит компоненты в **неправильную папку**. См. T-3.0. |
| `<html lang="en" suppressHydrationWarning>` без `className` | **Подтверждено** (`layout.tsx:46`). `suppressHydrationWarning` нужен только из-за next-themes-класса; после демонтажа — убрать. Глобально в `layout.tsx` смонтированы `ApiUrlSwitcher` и `TokenLimitDialogProvider` (учесть в перекраске). |
| Новые auth-файлы | **Подтверждено:** `src/app/(auth)/verify-email/page.tsx` (**253 строки**), `features/auth/ui/ResendVerificationButton.tsx` (+ `LoginForm.tsx`, `RegisterForm.tsx`) — включены в объём перекраски auth-флоу. |

### Что из F0 переиспользуется vs выбрасывается
- **Переиспользуется:** общая light-структура токенов (`--bg-primary #ffffff`,
  `--text-primary #0a0a0a`, двойная система имён, `@theme inline`-маппинг),
  плоский характер теней (F0 уже «subtle»), motion-токены, keyframes/`tw-animate-css`,
  существующие CVA-варианты как основа (button/badge/card/alert/plan-badge).
- **Выбрасывается целиком:** розовая палитра `#FF006E`/`#E00062`/`#EC4899`
  (+ `--color-glow`), **Playfair Display** и `--font-heading` (серифные заголовки),
  градиентный текст `.text-gradient` (спекой не предусмотрен), тёмная тема целиком.
- `docs/F0_DESIGN_SYSTEM_DOCUMENTATION.md` после редизайна устаревает → задача T-2.7
  (пометить как archived, шапка со ссылкой на этот план).

---

## 1. Резюме + итоговая таблица токенов

### 1.1. Что меняется (одной строкой)
Удаляем dark-тему и `next-themes`; единственный набор токенов в `:root` (light);
розовый акцент `#FF006E` → **кислотно-зелёный** градиентный primary с **чёрным**
текстом; Playfair Display (серифные заголовки) + Inter → **IBM Plex Sans** (текст) +
**JetBrains Mono** (заголовки/цифры/бейджи/ID, с добавленной кириллицей); бордовый
вторичный акцент; плоский «технический» стиль теней; анимации точечно с 21st.dev
на `motion`.

### 1.2. Итоговая таблица токенов (все hex, контраст-проверки WCAG 2.1)

Контраст считался по relative luminance (sRGB). «text» = порог 4.5:1 (обычный текст),
«UI» = порог 3:1 (крупный bold-текст / границы активных UI-компонентов / фокус-ринг /
смысловые иконки).

#### Поверхности и текст
| Токен | Hex | Контраст-проверка | Вердикт |
|---|---|---|---|
| `--background` / `--bg-primary` | `#FFFFFF` | — | фон |
| `--bg-secondary` | `#F7F7F8` | — | карточки/сайдбар (F0 был `#fafafa` — слегка темнее для разделения) |
| `--bg-hover` | `#EFEFF1` | — | ховеры строк (F0 был `#f5f5f5`) |
| `--foreground` / `--text-primary` | `#0A0A0B` | на `#FFFFFF` = **19.79:1** | text PASS |
| `--text-secondary` | `#52525B` | на `#FFFFFF` = **7.73:1**; на `#F7F7F8` = **7.22:1** | text PASS |
| `--text-muted` | `#A1A1AA` | на `#FFFFFF` = **2.56:1** | **только декоративные подписи/плейсхолдеры** (НЕ функциональный текст); для обязательного — `--text-secondary` |
| `--border` / `--input` | `#E4E4E7` | на `#FFFFFF` = 1.27:1 | граница декоративная; для границ интерактивных контролов с требованием 3:1 — `#A1A1AA` на hover/focus |

#### Primary — кислотно-зелёный (градиент + плоский)
| Токен | Hex | Контраст-проверка | Вердикт |
|---|---|---|---|
| `--gradient-primary` | `linear-gradient(135deg, #9FFF5B 0%, #5BFF8F 100%)` | чёрный `#0A0A0B` на `#9FFF5B` = **15.95:1**, на `#5BFF8F` = **15.21:1** | текст ЧЁРНЫЙ — PASS; белый на `#9FFF5B` = 1.24:1 — **запрещён** |
| `--primary` (плоский fallback заливки) | `#5BFF8F` | как часть градиента, текст чёрный | для не-градиентных primary-плашек с чёрным текстом |
| `--primary-foreground` | `#0A0A0B` | — | текст/иконка на primary |
| `--primary-ring` (focus ring, иконки, активные бордеры) | `#3F9E1A` | на `#FFFFFF` = **3.43:1** | UI PASS (≥3:1) — ring/иконки/активные бордеры, **НЕ текст** |
| `--primary-link` (ссылки, текст-акцент, активный пункт сайдбара как текст) | `#2E7D14` | на `#FFFFFF` = **5.17:1** | text PASS — ссылки и акцентный текст |

> **Ключевой вывод контраста:** предложенный спекой `#65D926` даёт **1.83:1** на
> белом — не проходит даже UI 3:1, как ring/иконка не годится. Заменён на `#3F9E1A`
> (ring/иконки, 3.43:1) и `#2E7D14` (текст-ссылки, 5.17:1). Это уточнение hex внутри
> утверждённой спеки (спека прямо требует «ПРОВЕРЬ контраст»).
> **Замена F0:** `--accent-primary` `#FF006E` (розовый) → зелёная семантика
> (иконки/активные состояния = `--primary-ring`, контраст-текст = `--primary-link`).

#### Destructive — красный (градиент + плоский)
| Токен | Hex | Контраст-проверка | Вердикт |
|---|---|---|---|
| `--gradient-destructive` | `linear-gradient(135deg, #FF4D4D 0%, #C41E3A 100%)` | белый на `#FF4D4D` = 3.27:1 (UI only), на `#C41E3A` = **5.84:1** | белый текст: на тёмном крае PASS, на светлом — UI-уровень; кнопка с центрированным белым ≥14px medium читается (средний контраст выше 4.5). **Помечено риском** — при сомнении сместить текст к тёмной зоне градиента. |
| `--destructive` (плоский) | `#DC2626` | белый на нём = **4.83:1** | text PASS — ошибки, опасные бордеры/текст |
| `--destructive-foreground` | `#FFFFFF` | — | текст на destructive |

#### Бордовый — вторичный акцент
| Токен | Hex | Контраст-проверка | Вердикт |
|---|---|---|---|
| `--burgundy` | `#6E1423` | текст `#6E1423` на белом = **11.75:1**; белый на `#6E1423` = **11.75:1** | text PASS в обе стороны |
| `--burgundy-light` | `#9A2540` | белый на нём = **7.74:1** | text PASS |
| `--gradient-burgundy` | `linear-gradient(135deg, #9A2540 0%, #6E1423 100%)` | белый текст | PASS |

#### Семантика статусов (согласована с primary — success НЕ выглядит как CTA)
| Токен | Hex (заливка/UI) | Hex (текст на белом) | Контраст-проверка |
|---|---|---|---|
| `--success` | `#16A34A` (заливка/иконка) | текст: `#15803D` | `#16A34A` на белом 3.30:1 (UI PASS); белый на `#16A34A` = 3.30:1 (**fail text** → success-бейдж с белым текстом брать на `#15803D`, белый на нём 5.02:1 PASS); `#15803D` текст на белом 5.02:1 PASS |
| `--warning` | `#D97706` (заливка/иконка) | текст: `#B45309` | `#D97706` на белом 3.19:1 (UI PASS); белый на `#D97706` = 3.19:1 (**fail text** → warning-бейдж с тёмным `#0A0A0B`-текстом, либо заливка `#B45309` для белого: белый на `#B45309` 5.02:1 PASS); `#B45309` текст на белом 5.02:1 PASS |
| `--info` | `#2563EB` | текст: `#2563EB` | белый на `#2563EB` = **5.17:1** PASS в обе стороны |
| `--error` | `#DC2626` | см. destructive | белый на нём 4.83:1 PASS |

> **Правило для бейджей-заливок:** где раньше был `text-white` на success/warning/active
> (F0: `bg-success text-white` и т.п.), белый текст НЕ проходит 4.5:1. Решение: либо
> тёмная заливка (`#15803D`/`#B45309`), либо subtle-вариант (`/10` + тёмный текст).
> Info и error с белым текстом проходят.

#### Чарты (recharts, 6 цветов вокруг зелёный/бордовый/чёрный + нейтрали)
F0-палитра чартов была построена вокруг розового (`--chart-1: #FF006E`) — пересобирается.
| Токен | Hex | Роль |
|---|---|---|
| `--chart-1` | `#16A34A` | основной зелёный (спокойный, не кислотный — кислотный на area-графиках режет глаз) |
| `--chart-2` | `#6E1423` | бордовый |
| `--chart-3` | `#0A0A0B` | чёрный/графит |
| `--chart-4` | `#71717A` | нейтрально-серый (zinc-500) |
| `--chart-5` | `#2563EB` | технический синий |
| `--chart-6` | `#D97706` | технический янтарь (акцент-выброс) |

#### Тени — выбранный вариант: «плоский техно» (тонкие бордеры + лёгкие тени)
Neo-brutalism (жёсткие offset-тени) отвергнут: на 54 компонентах и плотных таблицах
шумит и ломает читаемость. F0-тени уже «subtle» — ужесточаем минимализм:
| Токен | Значение |
|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgba(10,10,11,0.04)` |
| `--shadow-md` | `0 1px 3px 0 rgba(10,10,11,0.06), 0 1px 2px -1px rgba(10,10,11,0.06)` |
| `--shadow-lg` | `0 4px 12px -2px rgba(10,10,11,0.08), 0 2px 6px -2px rgba(10,10,11,0.06)` |
| Карточки по умолчанию | без тени, `border border-border` (убрать F0-`dark:shadow` из `card.tsx`) |
| Поднятые поверхности (popover/dropdown/dialog) | `--shadow-lg` |

#### Прочие токены (без изменений, перенести как есть)
`--radius-*` (4/6/12/20/24/full), `--duration-*`, `--ease-*` — переносятся как есть.
`--color-glow` (розовый) — удалить.

---

## 2. Выбор шрифтовой пары (с обоснованием по кириллице)

### Проверка фактов (Google Fonts / next/font) — зафиксировано, не пересматривается
- **Space Grotesk — кириллицы НЕТ** (Latin/Latin-ext/Vietnamese). Как основной
  текстовый шрифт русскоязычного интерфейса напрямую непригоден.
- **JetBrains Mono — кириллица ЕСТЬ** (Latin, **Cyrillic**, Cyrillic-ext, Greek).
  В `next/font/google` доступен сабсет `"cyrillic"`. **Текущая база грузит JBM с
  `subsets:["latin"]` — добавить `"cyrillic"`.**
- **IBM Plex Sans — кириллица ЕСТЬ** (`latin`, `latin-ext`, **`cyrillic`**, …) в
  `next/font/google`.

### Решение (зафиксировано)
**Текстовый гротеск: IBM Plex Sans** (`subsets: ["latin","cyrillic"]`).
**Заголовки/цифры/бейджи/ID: JetBrains Mono** (`subsets: ["latin","cyrillic"]`).

**Обоснование:**
1. **Родная пара.** IBM Plex Sans — сестринский шрифт к IBM Plex Mono из одной
   суперсемьи; «инженерный/технический» характер, в духе light-techno; со JetBrains
   Mono сочетается стилистически.
2. **Кириллица из коробки** у обоих, один сабсет-параметр, без подмешивания
   системного фолбэка и рассинхрона метрик (что было бы при «Space Grotesk + system
   cyrillic fallback»).
3. Интерфейс полностью русскоязычный → кириллица — жёсткое требование. Поэтому
   спека-кандидат Space Grotesk заменён на IBM Plex Sans (спека прямо называет его
   рекомендуемым дефолтом при отсутствии кириллицы у Space Grotesk).
4. Self-hosting через `next/font/google` (CLS-safe, без внешних запросов).

**Распределение (заменяет F0 Playfair+Inter):**
- `--font-sans` → IBM Plex Sans: параграфы, описания, формы, контент таблиц, лейблы,
  тосты/алерты. (Заменяет Inter.)
- `--font-mono` → JetBrains Mono: h1–h6, цифры/метрики/счётчики, бейджи, текст кнопок
  (опц. uppercase для CTA), ID/коды/секреты, числовые колонки, «технические» подписи
  (`TOKENS_USED`-стиль), значения stats-card/token-counter. (Заменяет Playfair-заголовки.)
- `--font-heading` (Playfair) — **полностью удалить** (variable, `@font-face`,
  `@theme`-объявление, правило `h1..h6,.font-heading`).
- Числовые колонки: `font-variant-numeric: tabular-nums` (utility `.tabular-nums`).

---

## 3. Фазы

- **Фаза 0 — Токены + шрифты + демонтаж dark.** Один большой блок (внутри допускается
  «полуперекрашено»). Перекрашивает почти всё через токены. Блокер для остальных фаз:
  сначала утверждённая таблица 1.2.
- **Фаза 1 — Варианты компонентов.** Градиентные кнопки, бейджи, прогрессы,
  chart-палитра, plan-badge, limit-alert, stats/token, sonner/alert. Каждая задача атомарна.
- **Фаза 2 — Зачистка хардкодов + страницы.** 19 hex + 12 tailwind-цветов,
  статус-бейдж, лендинг, design-system под env-гейтом, судьба F0-доки.
- **Фаза 3 — Анимации с 21st.dev.** По точкам внедрения, частями, через `next/dynamic`,
  с `prefers-reduced-motion`.

Порядок безопасности: Фаза 0 и Фаза 1 (токены/шрифты/демонтаж dark, CVA-варианты)
НЕ конфликтуют с декомпозицией больших страниц. Зачистку хардкодов на
страницах-монстрах (Фаза 2) — выполнять ПОСЛЕ их разбиения либо помечать merge-риском
(см. координацию).

---

## 4. Задачи

Формат: `T-номер | Фаза | Приоритет | Трудоёмкость (S/M/L/XL) | Риск | Зависимости`.

---

### ФАЗА 0 — Фундамент (выполняется одним блоком, build зелёный в конце блока)

#### T-0.1 — Переписать `globals.css`: единый light-набор токенов
- **Фаза 0 | P0 | L | Риск: средний | Зависит от: раздел 1.2 (утверждённые hex)**
- **Файлы:** `src/app/globals.css`
- **Шаги:**
  1. Удалить `@custom-variant dark (&:is(.dark *));` (стр. 4).
  2. Удалить все три `@font-face` (стр. 15-42: Playfair, Inter, JBM) — next/font самохостит (баг-дубль).
  3. Блок `:root, .light` (142-230) → **один** `:root` со значениями из таблицы 1.2.
     Блок `.dark` (235-322) удалить целиком. Класс `.light`/`.dark` убрать.
  4. В `:root` добавить новые токены: `--gradient-primary`, `--gradient-destructive`,
     `--gradient-burgundy`, `--burgundy`, `--burgundy-light`, `--primary-ring`,
     `--primary-link`. Удалить розовые `--accent-primary/-hover` (→ зелёная семантика),
     `--color-glow`.
  5. `@theme inline`: `--font-sans` → IBM Plex Sans-стек; **удалить `--font-heading`**
     (стр. 52-53); зарегистрировать новые цвет-токены (`--color-burgundy`,
     `--color-burgundy-light`, `--color-primary-ring`, `--color-primary-link`).
     **Сохранить ОБЕ системы имён** (CODE_STANDARDS + shadcn legacy) — не переименовывать.
  6. `--primary` = `#5BFF8F`, `--primary-foreground` = `#0A0A0B`. `--ring` = `#3F9E1A`
     (был `#FF006E`). `--accent-primary` (использует сайдбар) → `var(--primary-ring)`,
     `--accent-contrast` → `#0A0A0B`. Status/semantic-токены — из 1.2.
  7. Тени — значения «плоский техно» из 1.2.
  8. `@layer base`: правило `h1..h6, .font-heading { font-family: var(--font-heading) }`
     (стр. 355-358) → `font-family: var(--font-mono)` (и убрать `.font-heading`-селектор
     или оставить как алиас mono). Добавить utility `.tabular-nums { font-variant-numeric: tabular-nums; }`.
  9. `::selection` (стр. 350) `bg-primary/20` → проверить: чёрный текст на
     полупрозрачном кислотном — ок; оставить `bg-primary/30 text-foreground`.
  10. `:focus-visible` ring (стр. 345, `ring-ring`) теперь зелёный `#3F9E1A` (3.43:1, виден).
  11. `.text-gradient` (461-463) — перенаправить на `--gradient-primary` ИЛИ удалить
      (в tsx не используется). Рекомендация: оставить utility, перенаправить, не применять к большим текстам.
  12. `.skeleton-shimmer` (617-621) — градиент `--muted → --bg-hover` сверить с новыми токенами.
- **Критерий приёмки:** один `:root`, ни одного `.dark`/`.light`/`@font-face`/`--font-heading`;
  `tsc --noEmit` и build зелёные; визуально приложение light, акцент зелёный.

#### T-0.2 — Шрифты в `layout.tsx`
- **Фаза 0 | P0 | S | Риск: низкий | Зависит от: T-0.1**
- **Файлы:** `src/app/layout.tsx`
- **Шаги:**
  1. `import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";` — **убрать
     `Playfair_Display` и `Inter`**.
  2. Удалить блок `playfairDisplay` (стр. 11-16). IBM_Plex_Sans требует `weight`
     (не variable): `weight: ["400","500","600","700"]`, `subsets:["latin","cyrillic"]`,
     `variable:"--font-sans"`, `display:"swap"`.
  3. `jetbrainsMono` — `subsets: ["latin","cyrillic"]` (добавить cyrillic).
  4. `<body className>` (стр. 47): убрать `${playfairDisplay.variable}`, заменить
     `inter.variable` на `ibmPlexSans.variable`; оставить `${jetbrainsMono.variable} font-sans antialiased`.
- **Критерий приёмки:** билд тянет оба шрифта с кириллицей; русский текст — гротеском,
  заголовки — моно; нет внешних запросов к gstatic в Network; Playfair не грузится.

#### T-0.3 — Демонтаж dark: провайдер, sonner, next-themes, `<html>`
- **Фаза 0 | P0 | M | Риск: средний | Зависит от: T-0.1**
- **Файлы:** `src/providers/ThemeProvider.tsx`, `src/providers/index.ts`,
  `src/shared/ui/sonner.tsx`, `src/app/layout.tsx`, `package.json`
- **Шаги:**
  1. `ThemeProvider.tsx` → passthrough (`return <>{children}</>`), убрать импорт
     `next-themes` (меньше правок call-site, чем удаление обёртки).
  2. `sonner.tsx` — убрать `useTheme` (стр. 3,15), захардкодить `theme="light"`.
  3. `layout.tsx` — `<html lang="en">` (убрать `suppressHydrationWarning`, стр. 46).
  4. `package.json` — пометить `next-themes` к удалению (фактический `npm uninstall` —
     отдельным шагом исполнителя; **в этой сессии npm не запускается**).
- **Критерий приёмки:** ни один файл не импортирует `next-themes` (кроме помеченного
  к удалению пакета); тосты light; гидратация без warning; build зелёный.

#### T-0.4 — Демонтаж dark: app-shell + header toggle
- **Фаза 0 | P0 | M | Риск: средний | Зависит от: T-0.3**
- **Файлы:** `src/widgets/app-shell/ui/app-shell.tsx`, `src/widgets/app-shell/ui/header.tsx`
- **Шаги:**
  1. `app-shell.tsx` — убрать `useTheme` (стр. 4,35), `mounted`-логику (стр. 36),
     `toggleTheme` (стр. 44), `isDark` (стр. 48), пропсы `onThemeToggle`/`isDark`
     в `<Header>` (стр. 77-78).
  2. `header.tsx` — удалить блок «Theme toggle» (стр. 121-125: кнопка `Moon`/`Sun`),
     пропсы `onThemeToggle`/`isDark` (стр. 40-41,51-52), импорты `Moon`/`Sun` (стр. 7).
  3. Проверить `sidebar.tsx` — toggle темы там НЕТ (подтверждено), `accent-primary`
     перекрасится сам через токены.
- **Критерий приёмки:** в шапке нет переключателя темы; нет ссылок на next-themes;
  shell рендерится; build зелёный.

#### T-0.5 — Удалить 18 `dark:`-вариантов
- **Фаза 0 | P0 | M | Риск: низкий | Зависит от: T-0.1**
- **Файлы и замены (пофайльно):**
  - `src/shared/ui/badge.tsx` — 5 шт. (`*-subtle`, стр. 34-39): убрать `dark:bg-*/20`,
    оставить light-`/10`. Для `primary-subtle` (стр. 39) текст `text-primary` →
    `text-primary-link` (кислотный `#5BFF8F` как текст нечитаем).
  - `src/shared/ui/switch.tsx` — 2 шт.; `src/shared/ui/input.tsx` — 2 шт.: удалить
    `dark:`-классы, оставить базовый токен-класс.
  - `src/shared/ui/card.tsx` — 1 шт. (стр. 12: `dark:shadow-[...]`): удалить (карточки
    без тени по новой спеке).
  - `src/shared/ui/tabs.tsx`, `radio-group.tsx`, `toggle.tsx`, `select.tsx`,
    `checkbox.tsx`, `textarea.tsx`, `dropdown-menu.tsx` — по 1 `dark:`: удалить.
  - `src/app/(dashboard)/projects/[id]/avatars/[avatarId]/chat/page.tsx` — 1 шт.: удалить.
- **Критерий приёмки:** `grep -rn "dark:" src --include="*.tsx"` → 0; компоненты не сломаны.

> **Примечание:** T-0.1…T-0.5 — единый блок Фазы 0. После блока: `tsc --noEmit` + lint
> + build зелёные, приложение целиком в новой light-теме.

---

### ФАЗА 1 — Варианты компонентов

#### T-1.1 — `button.tsx`: градиентные варианты + mono
- **Фаза 1 | P0 | M | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/button.tsx`
- **Шаги:**
  1. Обновить устаревший комментарий стр. 14 (`Hot Pink #FF006E`).
  2. В CVA `variant` ДОБАВИТЬ (не переписывая `default`/`secondary`/`ghost`/`destructive`/
     `outline`/`link`/`success`):
     - `gradient`: `bg-[image:var(--gradient-primary)] text-[var(--primary-foreground)] font-mono shadow-sm hover:brightness-105 active:scale-[0.98]` (текст ЧЁРНЫЙ).
     - `gradient-destructive`: `bg-[image:var(--gradient-destructive)] text-white font-mono shadow-sm hover:brightness-105 active:scale-[0.98]`.
     - `gradient-burgundy`: `bg-[image:var(--gradient-burgundy)] text-white font-mono shadow-sm hover:brightness-110 active:scale-[0.98]`.
  3. (Опц.) для `lg`/`xl` при gradient — `uppercase tracking-wide`.
  4. Shine-эффект hover — отдельная задача T-3.1, здесь статичный градиент.
- **Call-sites:** новые варианты opt-in; существующие не трогаются (обратная совместимость).
  Grep: `grep -rn 'variant=' src --include="*.tsx" | grep -i button`.
- **Критерий приёмки:** в design-system — 3 градиентные кнопки с читаемым текстом;
  старые варианты не изменились; API не сломан.

#### T-1.2 — `badge.tsx`: семантика контраста + mono + burgundy
- **Фаза 1 | P1 | S | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/badge.tsx`
- **Шаги:**
  1. `success`/`active` (`text-white`, стр. 23,29): белый на `#16A34A` не проходит
     4.5:1 → заливка `#15803D`-тон или тёмный текст. `warning` (стр. 25): белый на
     `#D97706` не проходит → тёмный текст `text-[#0A0A0B]` либо заливка `#B45309`.
     `info`/`failed`/`destructive` с белым — проходят, оставить.
  2. `default` (primary-бейдж, стр. 14) на кислотном → `text-[var(--primary-foreground)]` (чёрный).
  3. `outline-primary`/`primary-subtle` — текст `text-primary` → `text-primary-link`.
  4. `font-mono` для бейджей (technical) — у `secondary`/`tag` уже есть; добавить
     остальным где уместно.
  5. Добавить вариант `burgundy`: `border-transparent bg-[var(--burgundy)] text-white`.
- **Критерий приёмки:** все бейджи читаемы (контраст из 1.2); mono; build зелёный.

#### T-1.3 — `progress.tsx` + `usage-progress-bar.tsx`: градиентная заливка
- **Фаза 1 | P1 | S | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/progress.tsx`, `src/shared/ui/usage-progress-bar.tsx`
- **Шаги:**
  1. `progress.tsx` Indicator `bg-primary` → `bg-[image:var(--gradient-primary)]`,
     трек `bg-primary/20` → `bg-bg-hover`.
  2. `usage-progress-bar.tsx`: «зелёный» уровень → градиент primary; `yellow`/`red` —
     плоские `bg-warning`/`bg-error` (семантика тревоги). Текст-проценты `text-success/
     warning` — для текста брать тёмные тона (1.2).
- **Критерий приёмки:** «зелёный» прогресс — кислотный градиент; жёлтый/красный плоские;
  числа форматируются как раньше.

#### T-1.4 — `usage-chart.tsx`: хардкод hex → токены + новая chart-палитра
- **Фаза 1 | P1 | M | Риск: средний | Зависит от: Фаза 0 (chart-токены)**
- **Файлы:** `src/shared/ui/usage-chart.tsx`
- **Шаги:** 6 хардкод-hex: `#4ade80`×3 → `var(--chart-1)` (стр. 164,165,201),
  `#60a5fa`×3 → `var(--chart-5)` (стр. 168,169,209), в `<stop stopColor>` и
  `<Area stroke>`. recharts читает CSS-var через `stroke="var(--chart-1)"`; для
  `<stop stopColor>` в SVG-`<defs>` — `var(...)` работает в совр. браузерах; если
  рендер ломается — пробросить через JS-константу с `getComputedStyle` (fallback).
- **Критерий приёмки:** 0 хардкод-hex; цвета из chart-палитры 1.2; градиент-заливка корректна.

#### T-1.5 — `plan-badge.tsx`: tailwind-палитра → токены
- **Фаза 1 | P1 | S | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/plan-badge.tsx`
- **Шаги:** 5 строк (стр. 13,17,21,25,29: `zinc/blue/emerald/violet/amber-500`) → токены:
  free → `bg-bg-hover text-text-secondary border-border`;
  starter → `bg-info/10 text-info border-info/20`;
  growth → `bg-success/10 text-[#15803D] border-success/20`;
  scale → `bg-burgundy/10 text-burgundy border-burgundy/20`;
  enterprise → `bg-[image:var(--gradient-primary)] text-[#0A0A0B]` (премиум) или
  `bg-warning/10 text-[#B45309]`. Добавить `font-mono`.
- **Критерий приёмки:** 0 tailwind-палитры в файле; бейджи читаемы; mono.

#### T-1.6 — `limit-alert.tsx`: orange-500 → токены
- **Фаза 1 | P1 | S | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/limit-alert.tsx`
- **Шаги:** 3 строки (стр. 31-33: `bg-orange-500/10`, `border-orange-500/30`,
  `text-orange-500`) для уровня «warning»/предупреждения → `bg-warning/10`,
  `border-warning/30`, `text-[#B45309]` (тёмный warning-тон для текста, 5.02:1).
  Остальные уровни (`bg-warning/10`, `bg-error/10`) уже на токенах.
- **Критерий приёмки:** 0 tailwind-палитры в файле; алерт читаем.

#### T-1.7 — `stats-card.tsx` + `token-counter.tsx`: mono + tabular-nums
- **Фаза 1 | P2 | S | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/stats-card.tsx`, `src/shared/ui/token-counter.tsx`
- **Шаги:** значение `value` (stats-card) и проценты/числа (token-counter) →
  `font-mono tabular-nums`. Иконочные плашки `bg-accent-primary/10` остаются
  (accent-primary теперь зелёный). `text-success/warning/error` — для текста тёмные тона (1.2).
- **Критерий приёмки:** метрики моноширинные, цифры не «прыгают».

#### T-1.8 — `sonner.tsx`, `alert.tsx`, `skeleton.tsx`, `card.tsx`: косметика
- **Фаза 1 | P2 | S | Риск: низкий | Зависит от: Фаза 0**
- **Файлы:** `src/shared/ui/alert.tsx`, `skeleton.tsx`, `card.tsx` (sonner — уже light в T-0.3)
- **Шаги:** `alert.tsx` destructive — `text-destructive` на белом (`#DC2626` 4.83:1 PASS).
  `skeleton.tsx` — `bg-muted` (светло-серый) ок; опц. `.skeleton-shimmer`. `card.tsx` —
  убедиться, что после удаления `dark:shadow` (T-0.5) карточка `border border-border`
  без тени. В основном перекрашиваются токенами (категория «а»).
- **Критерий приёмки:** алерты/скелетоны/тосты/карточки в новой палитре.

---

### ФАЗА 2 — Зачистка хардкодов и страницы

#### T-2.0 — Общий статус-бейдж и форматтеры (если не создал рефакторинг)
- **Фаза 2 | P1 | M | Риск: низкий | Зависит от: координация (заглушка в конце)**
- **Файлы:** `src/shared/ui/status-badge.tsx` (новый), `src/shared/lib/` форматтеры
- **Шаги:** см. заглушку координации — **создаёт тот трек, что исполняется первым**.
  Если рефакторинг уже создал — здесь только использовать. Если нет — создать
  `status-badge.tsx` (на базе `badge.tsx` active/draft/processing/failed) и вынести
  `formatTokens`/`formatCompact` (дублируются в `usage-progress-bar.tsx`/`token-counter.tsx`).
- **Критерий приёмки:** один источник статус-бейджа и форматтеров; дубли удалены.

#### T-2.1 — Зачистка `#0088cc` (Telegram-бренд) в 3 файлах
- **Фаза 2 | P2 | S | Риск: низкий | Зависит от: Фаза 0; merge-риск с декомпозицией**
- **Файлы:** `conversations/[conversationId]/page.tsx` (стр. 98,107),
  `integrations/telegram/page.tsx` (257,258),
  `integrations/telegram/sessions/[sessionId]/page.tsx` (213,220)
- **Шаги:** `#0088cc` — легитимный бренд-цвет Telegram. Вынести в токен
  `--brand-telegram: #0088cc` в globals; заменить `bg-[#0088cc]/10`/`text-[#0088cc]` на
  `bg-[var(--brand-telegram)]/10`. (Не «перекраска ради перекраски» — убираем хардкод.)
- **Критерий приёмки:** 0 `#0088cc` в tsx; иконки Telegram сохраняют бренд через токен.

#### T-2.2 — Зачистка `#ffcd33` (старый жёлтый дефолт аватара)
- **Фаза 2 | P2 | S | Риск: низкий | Зависит от: Фаза 0; merge-риск**
- **Файлы:** `avatars/new/page.tsx` (стр. 49,302,307,309),
  `avatars/[avatarId]/page.tsx` (62,397,402)
- **Шаги:** `#ffcd33` — `primary_color` аватара (доменное значение, дефолт; F0 его НЕ
  трогал). Вынести дефолт в константу `DEFAULT_AVATAR_COLOR` в `shared/config`, задать
  осмысленный дефолт (напр. `#5BFF8F` — новый primary). Не хардкодить в 7 местах.
- **Критерий приёмки:** дефолт в одной константе; 0 `#ffcd33` в tsx.

#### T-2.3 — Зачистка прямой tailwind-палитры в conversations
- **Фаза 2 | P2 | S | Риск: низкий | Зависит от: Фаза 0; merge-риск**
- **Файлы:** `conversations/[conversationId]/page.tsx` (стр. 100,109,139,158)
- **Шаги:** `amber-500`→`var(--warning)`/`text-warning`; `green-500`→`text-success`;
  `red-500`→`text-error`/`text-destructive` (feedback positive/negative, роль user).
  Для текста — тёмные тона из 1.2.
- **Критерий приёмки:** 0 прямой палитры в файле.

#### T-2.4 — Лендинг `src/app/page.tsx`: новый стиль целиком
- **Фаза 2 | P1 | L | Риск: средний | Зависит от: Фаза 0, T-1.1**
- **Файлы:** `src/app/page.tsx` (**265 строк** — F0 переписал)
- **Шаги:**
  1. Убрать `useTheme`/`toggleTheme`/`Moon`/`Sun` (стр. 12,15,18,38,50,124-125) — демонтаж темы.
  2. Hero: заголовок mono, акцентное слово через `--gradient-primary`, CTA
     `variant="gradient"`. Убрать розовые акцентные точки/`#FF006E`-паттерны F0.
  3. Фичи-карточки — токены, ховер через будущий T-3.7.
  4. Проверить битые ссылки `/design-system/tokens|patterns` (если есть) — убрать.
  5. Анимированный текст/фон — T-3.4 (Фаза 3), здесь статичная база.
  - **Актуальность:** публичная витрина дизайн-системы, рабочая. Сохраняем, обновляем стиль.
- **Критерий приёмки:** лендинг в новой теме, без переключателя, CTA градиентные.

#### T-2.5 — `design-system/page.tsx`: env-гейт + новые секции
- **Фаза 2 | P1 | L | Риск: средний | Зависит от: Фаза 0, Фаза 1**
- **Файлы:** `src/app/design-system/page.tsx` (790 строк)
- **Шаги:**
  1. Убрать `useTheme`/toggle (стр. 19,23,27,103,109,157-158, импорты `Moon`/`Sun`).
  2. В начало: `if (process.env.NODE_ENV === "production") notFound();` (гейт; НЕ удалять).
  3. Секции: градиентные кнопки (3), типографика (mono/grotesk-пары, кириллица),
     chart-палитра (6 свотчей), таблица токенов-свотчей с hex, анимированные компоненты
     (по мере Фазы 3).
- **Критерий приёмки:** в production → 404; в dev — витрина со всеми новыми элементами.

#### T-2.6 — `public/`: favicon/логотипы под светлый фон
- **Фаза 2 | P3 | S | Риск: низкий | Зависит от: —**
- **Файлы:** `public/favicon.ico`, `public/apple-touch-icon.png` (`layout.tsx:34-37`)
- **Шаги:** проверить, не «светлый логотип на прозрачном» (исчезнет на белом). Если
  завязан на тёмный фон — задача на перерисовку (дизайнерская, вне кода).
- **Критерий приёмки:** иконки видимы на белом фоне.

#### T-2.7 — Судьба `F0_DESIGN_SYSTEM_DOCUMENTATION.md`
- **Фаза 2 | P2 | S | Риск: низкий | Зависит от: Фаза 0 (после фактической смены стиля)**
- **Файлы:** `docs/F0_DESIGN_SYSTEM_DOCUMENTATION.md`
- **Шаги:** документ описывает УСТАРЕВШИЙ F0-стиль (розовый/Playfair). Пометить как
  archived: добавить шапку-баннер «⚠️ УСТАРЕЛО — заменён light-techno редизайном, см.
  `docs/UI_REDESIGN_PLAN.md`». Не удалять (исторический контекст; переиспользованные
  light-токены/паттерны секций лендинга всё ещё полезны как референс).
- **Критерий приёмки:** в шапке доки — пометка устаревания со ссылкой на этот план.

#### T-2.8 — Auth-флоу: перекраска (verify-email, resend, login/register формы)
- **Фаза 2 | P1 | M | Риск: низкий | Зависит от: Фаза 0, T-1.1**
- **Файлы:** `src/app/(auth)/verify-email/page.tsx` (253 стр.),
  `features/auth/ui/ResendVerificationButton.tsx`, `LoginForm.tsx`, `RegisterForm.tsx`,
  `src/app/(auth)/layout.tsx`
- **Шаги:** убрать любые розовые/F0-акценты, привести CTA к `variant="gradient"`,
  заголовки mono, токены вместо хардкодов. Фон auth — статичная база (анимация — T-3.3).
- **Критерий приёмки:** весь auth-флоу в новой теме; кнопки градиентные; контраст ок.

---

### ФАЗА 3 — Анимации с 21st.dev (детали компонентов — раздел 5)

#### T-3.0 — Подготовка: alias, motion, dynamic-обёртка
- **Фаза 3 | P0 (для фазы) | M | Риск: средний | Зависит от: Фаза 0**
- **Файлы:** `components.json`, `package.json`
- **Шаги:**
  1. **`components.json`:** `aliases.ui` = `@/components/ui` — не совпадает с
     `src/shared/ui`. Либо временно выставить корректный путь, либо ставить в
     `@/components/ui` и **переносить файлы вручную** в `src/shared/ui` (kebab-case),
     правя импорты `@/lib/utils` → `@/shared/lib` (`cn`). Зафиксировать процедуру.
  2. Добавить `motion` (новый пакет, не `framer-motion`; `motion` обратно совместим;
     импорты `from "motion/react"`). **`npm install` — отдельным шагом исполнителя,
     в этой сессии не запускается.**
  3. Тяжёлые блоки (фоны, чарты, hero) — через `next/dynamic({ ssr:false })`.
  4. Глобально уважать `prefers-reduced-motion`; где компонент не учитывает — добавить.
- **Критерий приёмки:** компонент 21st.dev ставится и попадает в `src/shared/ui` с
  корректными импортами токенов; `motion` в deps; build зелёный.

#### T-3.1 — CTA: shine/shimmer на градиентных кнопках
- **Фаза 3 | P2 | M | Риск: низкий | Зависит: T-3.0, T-1.1**
- **Точка 1.** Компонент: **Shimmer Button** (dillionverma/magicui), CSS-only.
  Адаптация: фон → `--gradient-primary`, `--shimmer-color` → светлый край, текст чёрный.
  Одна универсальная кнопка.
- **Критерий приёмки:** gradient-CTA с shine-hover; reduced-motion отключает блик.

#### T-3.2 — Числа/метрики: анимированный счётчик
- **Фаза 3 | P2 | M | Риск: низкий | Зависит: T-3.0**
- **Точка 2.** Компонент: **Number Ticker** (magicui). Подключить в `stats-card.tsx`,
  `token-counter.tsx`, `app/dashboard/page.tsx`, `settings/usage/page.tsx`. Адаптация:
  `font-mono tabular-nums`, цвет токен; reduced-motion → финал сразу.
- **Критерий приёмки:** метрики «накручиваются»; reduced-motion — статичны.

#### T-3.3 — Auth: анимированный фон
- **Фаза 3 | P3 | M | Риск: средний | Зависит: T-3.0, T-2.8**
- **Точка 3.** Файлы: `src/app/(auth)/layout.tsx`, `login/page.tsx`, `register/page.tsx`,
  `verify-email/page.tsx`. Компонент: **Animated Grid Pattern** / **Dot Pattern**
  (magicui). Через `next/dynamic`. Адаптация: цвет сетки `--border`, вспышки
  `--primary-ring`; reduced-motion → статичная сетка.
- **Критерий приёмки:** фон auth — тонкая техно-сетка; не мешает форме; reduced-motion ок.

#### T-3.4 — Лендинг hero: animated text
- **Фаза 3 | P2 | M | Риск: средний | Зависит: T-3.0, T-2.4**
- **Точка 4.** Файл: `src/app/page.tsx`. Компонент: **Text Rotate** (danielpetho, `motion`)
  для ротации слов, либо **Animated Shiny Text** (magicui). Фон hero — Animated Grid
  Pattern. Адаптация: моно-шрифт, акцент `--gradient-primary`; reduced-motion → статика.
- **Критерий приёмки:** hero «вау»; публичная страница; reduced-motion ок.

#### T-3.5 — Скелетоны/лоадеры: единый стиль
- **Фаза 3 | P3 | S | Риск: низкий | Зависит: T-3.0**
- **Точка 5.** Файлы: `src/shared/ui/skeleton.tsx`, `spinner.tsx`. **Достоверного
  «вау»-лоадера под наш минимализм нет — пишем СВОЁ на `tw-animate-css`:** есть
  `.skeleton-shimmer` (globals 617-621) и `@keyframes shimmer`. Адаптировать градиент
  под `--bg-secondary → --bg-hover`.
- **Критерий приёмки:** единый shimmer-скелетон на токенах; spinner — primary-ring.

#### T-3.6 — Чат: появление сообщений + typing-индикатор
- **Фаза 3 | P3 | M | Риск: средний | Зависит: T-3.0**
- **Точка 6.** Файлы: `src/shared/ui/chat.tsx`, `entities/chat`. Компонент:
  **Chat Interface** (tonyzebastian) — берём только typing-dots + анимацию появления
  бабблов (`motion` fade-up), не заменяя разметку чата. Адаптация: цвета токенами,
  dots `--text-muted`; reduced-motion → без анимации.
- **Критерий приёмки:** новые сообщения плавно появляются; есть typing; API чата
  (`ChatMessage`, feedback, copy) не сломан.

#### T-3.7 — Карточки проектов/аватаров: hover-эффект
- **Фаза 3 | P3 | M | Риск: средний | Зависит: T-3.0**
- **Точка 7.** Файлы: карточки в `projects/page.tsx`, `avatars/page.tsx`, `card.tsx`.
  Компонент: **Magic Card** (dillionverma). На белом glow слаб → **gradient-border на
  hover** (`--gradient-primary` тонкой рамкой) + лёгкий lift (`.card-hover` уже есть).
  Если Magic Card на белом плох — **писать своё на `tw-animate-css`** (`::before` mask).
  Предпочесть своё, если 21st-вариант не ложится на light.
- **Критерий приёмки:** карточки получают gradient-border/lift на hover; на белом
  читаемо; reduced-motion → без движения.

#### T-3.8 — Сайдбар: активный пункт с градиентной полоской
- **Фаза 3 | P2 | M | Риск: низкий | Зависит: T-3.0, Фаза 0**
- **Точка 8.** Файл: `src/widgets/app-shell/ui/sidebar.tsx` (529 стр.). Активный пункт
  сейчас `bg-accent-primary/10 text-accent-primary` (стр. 288,313,330,352,381 и др.).
  Добавить слева тонкую градиентную полоску (`--gradient-primary`, абсолютный `::before`/
  div), микро-анимацию перехода. **Достоверного 21st.dev-кандидата под «сайдбар-
  индикатор» нет — пишем своё на `tw-animate-css`** (полоска + `transition`, опц.
  layout-анимация на `motion`). Адаптация: цвет полоски — градиент, ховеры `--bg-hover`;
  reduced-motion → без скольжения.
- **Критерий приёмки:** активный пункт с зелёной градиентной полоской; переход плавный;
  collapsed-режим не сломан.

---

## 5. Компоненты 21st.dev — таблица внедрения

> Кандидаты перенесены из прошлой версии плана (проверены ранее фетчем страниц
> компонентов). Установка: `npx shadcn@latest add "<URL>"` → файл попадает по
> `components.json:aliases.ui` (сейчас `@/components/ui` — **перенести в `src/shared/ui`**,
> см. T-3.0). Каждый компонент адаптируется под токены (никаких хардкод-цветов из примеров).

| # | Точка внедрения | Компонент | Автор | URL установки (`/r/`) | Зависимости | Что адаптировать |
|---|---|---|---|---|---|---|
| 1 | CTA-кнопки (shine/shimmer) | **Shimmer Button** | dillionverma / magicui | `https://21st.dev/r/dillionverma/shimmer-button` | CSS-only (нет motion) | фон → `--gradient-primary`, `--shimmer-color` → светлый край, текст чёрный, reduced-motion |
| 2 | Числа/метрики (счётчик) | **Number Ticker** | magicui (dillionverma) | `https://21st.dev/r/dillionverma/number-ticker` | `framer-motion`/`motion` | `font-mono tabular-nums`, цвет токен, reduced-motion → финал |
| 3 | Auth — фон | **Animated Grid Pattern** (альт. **Dot Pattern**) | magicui / dillionverma | `https://21st.dev/r/dillionverma/animated-grid-pattern` (альт `.../dot-pattern`) | `framer-motion`/`motion` | цвет сетки `--border`, вспышки `--primary-ring`, `next/dynamic`, reduced-motion |
| 4 | Лендинг hero — animated text | **Text Rotate** (альт. **Animated Shiny Text**) | danielpetho (альт. magicui) | `https://21st.dev/r/danielpetho/text-rotate` (альт `https://21st.dev/r/magicui/animated-shiny-text`) | `motion` (Text Rotate) | моно-шрифт, акцент `--gradient-primary`, reduced-motion |
| 5 | Скелетоны/лоадеры | **кандидат не выбран — своё на `tw-animate-css`** (`.skeleton-shimmer` уже в globals) | — | — | нет | шиммер-градиент `--bg-secondary → --bg-hover` |
| 6 | Чат — появление/typing | **Chat Interface** (только typing-dots + fade-up) | tonyzebastian | `https://21st.dev/r/tonyzebastian/chat-interface` | `motion` | взять только индикатор и анимацию появления, dots `--text-muted`, не ломать API чата |
| 7 | Карточки — hover | **Magic Card** (предпочесть своё, если на белом плохо) | dillionverma / magicui | `https://21st.dev/r/dillionverma/magic-card` | `framer-motion`/`motion` | на белом glow слаб → gradient-border на hover (`--gradient-primary`), либо своё на `tw-animate-css` |
| 8 | Сайдбар — активная полоска | **кандидат не найден — своё на `tw-animate-css`** | — | — | опц. `motion` для layout | градиентная полоска `--gradient-primary` слева, transition, reduced-motion |

**Итог по 21st.dev:** для 6 из 8 точек — конкретные компоненты (1,2,3,4,6,7); для 2
точек (5 — лоадеры, 8 — индикатор сайдбара) достоверного кандидата под light-минимализм
нет — пишем своё на `tw-animate-css`. Точка 7 — Magic Card как опция, рекомендация — своё.

> URL формата `/r/<автор>/<slug>` — install-эндпоинт реестра (подставляет кнопка
> «npx shadcn add» на странице компонента `https://21st.dev/community/components/<автор>/<slug>`).

---

## 6. Что сознательно НЕ делаем

1. **Не переименовываем токены.** Двойная система имён (CODE_STANDARDS + shadcn legacy)
   остаётся — 54 компонента завязаны на обе; переименование = риск без выгоды.
2. **Не красим градиентом текст и большие поверхности.** Градиенты — только акценты
   (CTA, прогресс, активная полоска сайдбара, border выделенных карточек).
3. **Не делаем neo-brutalism-тени.** Плоский техно-минимализм (бордеры + лёгкие тени).
4. **Не трогаем `#0088cc` как «неправильный цвет»** — легитимный бренд Telegram; только
   убираем хардкод в токен `--brand-telegram`.
5. **Не используем кислотный зелёный на графиках** — спокойный `#16A34A` (кислотный на
   area-графиках режет глаз).
6. **Не переписываем разметку чата/таблиц ради анимаций** — только добавляем появление/
   индикаторы поверх существующего API.
7. **Не удаляем `design-system/page.tsx`** — гейтим по env (нужен для QA редизайна).
8. **Не зоопарк кнопок** — одна универсальная gradient-CTA с shine.
9. **Не используем `#A1A1AA` (`--text-muted`, 2.56:1) как функциональный текст** —
   только декоративные подписи/плейсхолдеры.
10. **Не удаляем `F0_DESIGN_SYSTEM_DOCUMENTATION.md`** — архивируем с пометкой (T-2.7).

---

## 7. Скриншот-чеклист приёмки по фазам

Скриншоты — на **1440px** и **375px**. (Build/замеры бандла — задачи T-G.*; в этой
сессии build НЕ запускается — параллельно работает build-агент.)

**После Фазы 0:**
- [ ] `design-system` (dev) — вся витрина light, акцент зелёный, шрифты mono/grotesk, кириллица; нет розового/Playfair.
- [ ] `/login`, `/register`, `/verify-email` — формы в новой теме, нет переключателя темы.
- [ ] `/dashboard` — метрики/карточки перекрашены.
- [ ] таблично-тяжёлая страница `admin/billing` — таблицы, бейджи, числа.
- [ ] `grep dark:` = 0; нет импортов `next-themes`; нет Playfair/`font-heading`; focus-ring зелёный виден на белом.

**После Фазы 1:**
- [ ] `design-system` — 3 градиентные кнопки (читаемый текст), бейджи (контраст),
      прогрессы (градиент/плоский), chart-палитра, plan-badge, limit-alert.
- [ ] `settings/usage` — usage-chart в новой палитре, без хардкод-hex.

**После Фазы 2:**
- [ ] лендинг `/` — новый стиль, CTA градиентные, без розовых акцентов.
- [ ] `design-system` в production → 404; в dev — все новые секции.
- [ ] `grep` хардкод-hex (кроме `--brand-telegram`/avatar-const) = 0; tailwind-палитра = 0.
- [ ] `F0_DESIGN_SYSTEM_DOCUMENTATION.md` помечен устаревшим.

**После Фазы 3:**
- [ ] CTA shine-hover; number-ticker; auth-фон; hero animated text; карточки hover;
      сайдбар-полоска; чат typing.
- [ ] `prefers-reduced-motion` — все анимации отключаются/упрощаются.

**Задачи на замеры/CI (оформлены как задачи; в этой сессии НЕ запускаются):**
- [ ] **T-G.1 (замер бандла):** `next build` → зафиксировать **First Load JS** на
      `/`, `/login`, `/dashboard` ДО и ПОСЛЕ Фазы 3 (бюджет `+motion` ≈ +30-50KB gzip;
      тяжёлые блоки — `next/dynamic`). **Запускать, когда build-агент освободит `.next`.**
- [ ] **T-G.2 (CI-гейты):** `npx tsc --noEmit` + `npm run lint` + `npm run build`
      зелёные после каждой задачи (Фаза 0 — после всего блока). Сборка в Docker на
      сервере с 3.8 GB RAM — без тяжёлых build-плагинов.
- [ ] **T-G.3 (a11y):** контраст всех новых пар подтверждён (таблица 1.2 ✓);
      `::selection` перекрашен; focus-ring виден.

---

## Координация с REFACTORING_PLAN.md — СВЕРЕНО (07.06.2026, по обоим планам новой базы)

1. **Порядок задач на больших страницах — РЕШЕНО.**
   Рефакторинг разбивает все страницы, где UI-трек чистит хардкоды:
   `integrations/telegram/page.tsx` → **T-19**; `avatars/[avatarId]/page.tsx`,
   `avatars/new/page.tsx`, `conversations/[conversationId]/page.tsx` и
   telegram-sessions — **T-22** (под-задачи).
   **UI-задачи T-2.1…T-2.3 исполнять ПОСЛЕ рефакторинг-T-19/T-22** для соответствующих
   страниц (или в их составе — тогда T-2.x сводится к проверке, что хардкоды не
   переехали в `_components/`). Токены/шрифты/демонтаж dark (UI Ф0) и CVA-варианты
   (UI Ф1) — без конфликтов, в любой момент.

2. **`design-system/page.tsx` — РЕШЕНО, конфликта нет.** Рефакторинг-**T-5** сам
   рекомендует вариант (б): `notFound()` при production, витрина остаётся в dev —
   совпадает с позицией UI-трека. Одна работа: исполняет первый трек (UI T-2.5 ≡
   рефакторинг T-5), второй пропускает. T-5 дополнительно убирает `DESIGN_SYSTEM`
   из `routes.ts` и чинит console/type-import этого файла — не дублировать.

3. **`status-badge` и форматтеры — РЕШЕНО: создаёт рефакторинг-трек.**
   - **T-10 `shared/lib/formatters.ts`** — покрывает все дубли, включая `formatTokens`/
     `formatCompact`/`formatTokenValue` из `usage-progress-bar`/`token-counter`/`usage-chart`.
   - **T-15 `shared/ui/status-badge.tsx`** — ~10 файлов с inline-маппингами.
   - **T-13 `useCountdown`** — пригодится UI-треку при перекраске auth-флоу (T-2.8).
   - UI-задача T-2.0 = «использовать готовые T-10/T-15». Если UI-трек идёт первым —
     создаёт их сам по спецификациям T-10/T-15 (там полные списки call-sites).

4. **`components.json` — за UI-треком.** Рефакторинг-план файл не упоминает (проверено).
   UI T-3.0 чинит `aliases.ui` без согласований.

5. **(новое) Пересечение по шрифтам.** Дубль `@font-face` в `globals.css` рефакторинг
   зафиксировал, но НЕ чинит (передал UI-треку) — закрывается в UI Ф0 (T-0.2).
   `ApiUrlSwitcher` (рефакторинг-T-8, security) перекрашивается в UI Ф1 — порядок:
   сначала T-8 (гейт), потом перекраска того, что осталось.

**Утверждённый сквозной порядок:**
1. Рефакторинг Ф0 (T-1 CI → T-2/T-3 tsc+eslint → T-4..T-9 гигиена; T-8 ApiUrlSwitcher — security, не откладывать)
2. **UI Ф0** одним блоком (токены, шрифты, демонтаж dark+Playfair)
3. Рефакторинг Ф1 (T-10 formatters, T-11 pagination, T-12 тесты, T-13 countdown, T-14 confirm, T-15 status-badge)
4. **UI Ф1** (CVA-градиенты, бейджи, прогрессы, чарты)
5. Рефакторинг Ф2 (T-16..T-22 декомпозиция)
6. **UI Ф2** (зачистка хардкодов на разбитых страницах, лендинг, design-system, auth-флоу)
7. **UI Ф3** (анимации 21st.dev) ∥ рефакторинг Ф3-5 (auth T-23, openapi T-24, перф T-25..T-27) — независимо.
