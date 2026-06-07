# План рефакторинга consuragfrontend

> Версия от 07.06.2026. Построена по текущей базе `main` (после мержа `feature/redesign-f0`).
> Все факты перепроверены чтением кода и прогоном `tsc`/`eslint`/`knip`/`next build`.
> Дизайн (цвета/шрифты/темы) — вне зоны этого плана (см. отдельный `UI_REDESIGN_PLAN.md`),
> но структурные проблемы дизайн-слоя (дубли `@font-face`, `ApiUrlSwitcher` в проде) включены.

---

## 1. Резюме

Проект архитектурно здоров: FSD соблюдается строго (`app → widgets → features → entities → shared`),
слой данных единообразен (`entities/<x>/api/*Api.ts` + `entities/<x>/model/use<X>.ts` с query-key factory),
`any` — 0, TODO — 0. Основной долг — **процедурный, а не архитектурный**: 5 страниц-монстров
(752/716/709/680/544 строки) совмещают фетчинг + формы + диалоги + таблицы; форматтеры
(`formatDate`/`formatCurrency`/`formatCompact`/`formatCooldown`) продублированы ~20 раз локально;
пагинация, confirm-диалоги (5 из них — нативный `window.confirm`) и статус-бейджи копируются между
страницами без абстракций.

Главные риски: (1) **рассинхрон auth-токенов** — `apiClient` хранит токен в `localStorage`
(`auth_token`), а middleware читает cookie `access_token`; cookie пишется только в `authApi`
(login/refresh/logout), но **интерсептор apiClient при собственном рефреше cookie НЕ обновляет** →
после автообновления токена cookie остаётся со старым (протухшим) значением; (2) `next.config.ts`
с `ignoreBuildErrors`/`ignoreDuringBuilds` **при отсутствии CI** — 11 ошибок `tsc` и 40 проблем
ESLint накопились и не видны в сборке; среди них реальный контрактный баг (`ProjectUsage` не имеет
полей `chat_tokens_used`/`embedding_tokens_limit`, которые читает страница аналитики);
(3) `ApiUrlSwitcher` смонтирован глобально и в проде доступен по Ctrl+Shift+A — пользователь может
переключить кабинет на dev-API; (4) тестов — 0, test-runner не настроен.

Ожидаемый эффект: фундамент (CI + гигиена) делает дальнейший рефакторинг безопасным; общие
абстракции (formatters, pagination, confirm-dialog, status-badge) убирают копипасту ДО декомпозиции
страниц (иначе дубли просто переедут в новые файлы); декомпозиция приводит `page.tsx` к ≤150 строкам;
починка auth закрывает security-риск; типы из OpenAPI снижают рассинхрон с бекендом. Сборка остаётся
лёгкой (Turbopack, ~5.4s компиляция, standalone) — тяжёлых шагов не добавляем, codegen — по ручной
команде.

---

## 2. Фазы

| Фаза | Содержание | Риск | Порядок |
|------|-----------|------|---------|
| **Фаза 0** | Фундамент: CI, починка tsc/eslint, мёртвый код, console.*, magic-numbers, гейт ApiUrlSwitcher, перенос docs | низкий | первая |
| **Фаза 1** | Общие абстракции: formatters, usePagination, confirm-dialog, status-badge, cooldown-хук + тесты на них | низкий-средний | после 0 |
| **Фаза 2** | Декомпозиция страниц-монстров (по одной странице = одна задача), под защитой CI | средний | после 1 |
| **Фаза 3** | Auth/токены: единый `tokenStorage`, синхронизация cookie при рефреше | средний-высокий | после 0 (независима от 2) |
| **Фаза 4** | Типы из OpenAPI (`openapi-typescript`, по одной entity) | низкий-средний | после 0 |
| **Фаза 5** | RSC/перфоманс: `next/dynamic` для recharts/markdown, сужение remotePatterns, санитизация | низкий | после 3 (RSC — только после auth) |

Порядок исполнения: **Фаза 0 → Фаза 1 (+тесты) → Фаза 2 → Фаза 3 → Фаза 4 → Фаза 5**.
Фазы 3 и 4 не зависят от Фазы 2 и могут идти параллельно после Фазы 0.

---

## 3. Задачи

### T-1. Настроить CI (GitHub Actions): tsc + eslint + build на PR
- **Фаза**: 0
- **Приоритет**: P0 (компенсирует `ignoreBuildErrors`, защищает все последующие задачи)
- **Трудоёмкость**: S
- **Риск**: low. Грозит: ничего; проверять — PR должен запускать workflow и краснеть при ошибках.
- **Зависимости**: нет
- **Файлы**: создать `.github/workflows/ci.yml`
- **Что сделать**:
  1. Remote — GitHub (`origin → github.com/MalikProtopopov/consuragfrontend.git`), Actions доступны.
  2. Workflow на `pull_request` и `push` в `main`: `node 20`, `npm ci --legacy-peer-deps`,
     далее три шага: `npx tsc --noEmit`, `npm run lint`, `npm run build`
     (`NODE_OPTIONS=--max-old-space-size=2048`, `NEXT_PUBLIC_API_URL` из секрета или заглушка).
  3. `ignoreBuildErrors`/`ignoreDuringBuilds` в `next.config.ts` оставить (сборка на слабом
     сервере 3.8 GB), но tsc/lint теперь обязательны в CI как отдельные шаги.
  4. Шаги tsc, lint и build — blocking.
- **Критерий приёмки**: PR с заведомой tsc-ошибкой не проходит CI; чистый PR — зелёный.

### T-2. Починить 11 ошибок `tsc --noEmit`
- **Фаза**: 0
- **Приоритет**: P0 (без этого CI всегда красный)
- **Трудоёмкость**: M
- **Риск**: medium — один из фиксов меняет контракт типа `ProjectUsage`; проверять страницу аналитики руками.
- **Зависимости**: нет (логично перед T-1, чтобы CI сразу зелёный)
- **Файлы**: изменить `next.config.ts`, `src/app/(dashboard)/projects/[id]/analytics/page.tsx`,
  `src/shared/types/api/analytics.types.ts`
- **Что сделать** (точный список ошибок):
  1. `next.config.ts(24,3)` — ключ `eslint` больше не валиден в `NextConfig` Next 16
     (build тоже выдаёт warning «Unrecognized key(s): 'eslint'»). В Next 16 `next lint` вынесен;
     убрать блок `eslint` из конфига, оставить только `typescript.ignoreBuildErrors`,
     а ESLint гонять отдельным шагом в CI (T-1).
  2. `analytics/page.tsx(82,83,91,97,114,115,123,129)` — 10 ошибок: чтение полей
     `chat_tokens_used`, `chat_tokens_limit`, `embedding_tokens_used`, `embedding_tokens_limit`
     у `ProjectUsage`. Этих полей нет ни в типе (`analytics.types.ts:82` — только `total_tokens`),
     ни в `docs/openapi.json` (нет разбивки chat/embedding на уровне проекта).
     **Это реальный контрактный баг**: страница показывает захардкоженные фолбэки
     (`?? 50000`, `?? 100000`) вместо настоящих лимитов. Решение: уточнить у бекенда фактические поля;
     если разбивки нет — переписать карточки на `total_tokens` или брать chat/embedding-лимиты из
     `useUsageSummary` (там поля `chat_tokens_used/limit`, `embedding_tokens_used/limit` реально
     существуют — см. `settings/usage/page.tsx`). Временно для зелёного tsc — расширить тип
     ProjectUsage только если бекенд эти поля действительно возвращает; иначе убрать обращения.
     Зафиксировать как зависимость от бекенда при необходимости.
- **Критерий приёмки**: `npx tsc --noEmit` без ошибок; `npx next build` без warning про `eslint`;
  `/projects/[id]/analytics` показывает корректные числа (не фейковые лимиты).

### T-3. Починить 40 проблем ESLint (21 error + 19 warning)
- **Фаза**: 0
- **Приоритет**: P1
- **Трудоёмкость**: M
- **Риск**: medium — часть (`set-state-in-effect`, `refs`) указывает на реальные анти-паттерны рендера.
- **Зависимости**: нет; часть пересекается с декомпозицией (Фаза 2) — мелкие чинить сейчас.
- **Файлы** (по группам ошибок из `npm run lint`):
  - **`no-duplicate-imports` (7, автофикс)**: `src/app/page.tsx:22`, `src/shared/ui/api-url-switcher.tsx:14`,
    `avatars/[avatarId]/chat/page.tsx:19`, `avatars/[avatarId]/page.tsx:30`,
    `integrations/telegram/sessions/[sessionId]/page.tsx:17`,
    `users/[userId]/conversations/[conversationId]/page.tsx:43`, `users/[userId]/page.tsx:40`.
  - **`prefer-template` (4, автофикс)**: `admin/audit/page.tsx:168`, `admin/billing/page.tsx:296`,
    `shared/ui/config-card.tsx:89`, `shared/ui/secret-input.tsx:30`.
  - **`react/self-closing-comp` (2)**: `dashboard/page.tsx:213` (уйдёт с T-4), `users/page.tsx:208`.
  - **`@typescript-eslint/consistent-type-imports` (1)**: `design-system/page.tsx:42` (уйдёт с T-5).
  - **`@typescript-eslint/no-unused-vars` (1)**: `shared/ui/stepper.tsx:20` — `currentStep`.
  - **`no-console` (warnings, 18)** → выносится в T-6.
  - **`@next/next/no-img-element` (warnings)**: `features/avatar/ui/AvatarCard.tsx:39`,
    `avatars/[avatarId]/chat/page.tsx` (4), `integrations/telegram/page.tsx:348` — миграция на
    `next/Image` зависит от T-26 (нужны разрешённые хосты). Оставить warning'ами здесь.
  - **`react-hooks/set-state-in-effect` (реальные анти-паттерны, не автофикс)**:
    `admin/requests/_components/PlanRequestDetailDialog.tsx:93`, `admin/users/[id]/page.tsx:55`,
    `avatars/[avatarId]/page.tsx:54`, `projects/[id]/settings/page.tsx:43`, `settings/profile/page.tsx:39` —
    инициализация формы из загруженных данных через `setState` в `useEffect`. Чинить через
    `key={data?.id}` (ремоунт формы) либо `defaultValues` react-hook-form. Также
    `users/[userId]/page.tsx:133` использует `useState(()=>{...})` как эффект и `setState` в теле рендера
    (148-153) — переписать на нормальную инициализацию.
  - **`react-hooks/refs` (1)**: `shared/ui/secret-input.tsx:57` — `onChangeRef.current = onChange`
    во время рендера; перенести в `useEffect`.
- **Что сделать**: сначала `npm run lint:fix` (7 автофиксов), затем вручную остальные. Анти-паттерны
  рендера чинить аккуратно — меняется поведение инициализации форм.
- **Критерий приёмки**: `npm run lint` — 0 error (warnings про `<img>` допустимы до T-26).

### T-4. Решить судьбу `src/app/dashboard/` (демо с mock-данными)
- **Фаза**: 0
- **Приоритет**: P1
- **Трудоёмкость**: S
- **Риск**: low.
- **Зависимости**: нет
- **Файлы**: удалить `src/app/dashboard/page.tsx` (326); изменить `middleware.ts` (убрать `/dashboard`
  из `PROTECTED_PREFIXES`), `src/shared/config/routes.ts` (убрать `DASHBOARD` и `/dashboard` из
  `PROTECTED_ROUTES`).
- **Что сделать**:
  1. Подтверждено: мёртвый код — захардкоженный английский `recentActivity` (mock), импортирует
     `AppShell` напрямую (вне группы `(dashboard)`), **попадает в прод-бандл** (роут `/dashboard` в build).
  2. Ссылок в навигации нет — упоминания `/dashboard` только в `routes.ts:7,85` и `middleware.ts:6`.
     Реальный кабинет — в `src/app/(dashboard)/` (группа, не в URL).
  3. Удалить файл и три упоминания.
- **Критерий приёмки**: build не содержит роут `/dashboard`; tsc/lint зелёные; вход ведёт на `/projects`.

### T-5. Исключить `src/app/design-system/` из прод-бандла
- **Фаза**: 0
- **Приоритет**: P1
- **Трудоёмкость**: S
- **Риск**: low.
- **Зависимости**: нет
- **Файлы**: `src/app/design-system/page.tsx` (790, mock-данные, 3 `console.*`, 1 type-import-ошибка);
  `src/shared/config/routes.ts` (`DESIGN_SYSTEM`).
- **Что сделать**: попадает в прод-бандл (роут `/design-system` в build). Варианты: (а) удалить;
  (б) `notFound()` при `process.env.NODE_ENV === "production"`. Рекомендуется (б) — оставляет витрину
  в dev. Убрать `DESIGN_SYSTEM` из `routes.ts` (навигации на него нет).
- **Критерий приёмки**: в прод-сборке `/design-system` отдаёт 404; в dev открывается; 3 `console.*` и
  type-import-ошибка этого файла исчезли из lint.

### T-6. Убрать/обусловить 18 `console.*`
- **Фаза**: 0
- **Приоритет**: P1
- **Трудоёмкость**: S-M
- **Риск**: low — проверить, не глотаются ли ошибки в catch.
- **Зависимости**: T-5 (3 console уйдут с design-system)
- **Файлы** (пофайльно): `src/entities/chat/model/useChat.ts` — 7 (91,96,101,112,120,123,127 — debug-логи;
  130,215 — `console.error` в catch); `src/entities/chat/api/chatApi.ts` — 2 (38,67);
  `src/app/design-system/page.tsx` — 3 (702,715,781,782; уйдут с T-5).
- **Что сделать**: debug-`console.log` в `useChat`/`chatApi` удалить. `console.error` в catch —
  условный логгер `if (process.env.NODE_ENV !== "production")` либо оставить (ESLint разрешает error/warn).
  Тяжёлую логгер-библиотеку не вводить.
- **Критерий приёмки**: `grep -rn "console.log" src/` пуст; lint без `no-console` warning.

### T-7. Вынести magic-numbers пагинации/таймаутов в `shared/config`
- **Фаза**: 0
- **Приоритет**: P2
- **Трудоёмкость**: S
- **Риск**: low.
- **Зависимости**: лучше до T-11 (pagination-хук возьмёт константу)
- **Файлы**: дополнить `src/shared/config/` (например `pagination.ts`); ~12 call-sites
  (`limit: 20`/`page * 20`/`skip:`) в `admin/billing`, `projects/[id]/users`,
  `integrations/telegram/sessions`, `admin/notifications/logs` и др.
- **Что сделать**: `PAGE_SIZE = 20`. Также таймаут axios (`30000`, `apiClient.ts:180`), окно
  proactive-refresh (`60000`, `apiClient.ts:105`), email-cooldown (`300`) — в именованные константы.
- **Критерий приёмки**: tsc/lint зелёные; поведение пагинации не изменилось.

### T-8. Гейт `ApiUrlSwitcher` по env (security)
- **Фаза**: 0
- **Приоритет**: P0 (пользователь может переключить кабинет на dev-API в проде)
- **Трудоёмкость**: S
- **Риск**: medium — неверный гейт скроет переключатель и в dev.
- **Зависимости**: нет
- **Файлы**: `src/app/layout.tsx` (монтаж `<ApiUrlSwitcher/>`, строка 54);
  `src/shared/ui/api-url-switcher.tsx`; возможно `src/shared/lib/apiUrlManager.ts`.
- **Что сделать**:
  1. Текущее: панель смонтирована глобально. Видимость по умолчанию `false` в проде
     (`isVisible = NODE_ENV === "development"`), НО хоткей **Ctrl+Shift+A** включает её в любом
     окружении, а `apiUrlManager.getApiUrl()` читает override из `localStorage` независимо от env.
     Итог: в проде можно открыть панель и переключить `apiClient` на dev-API — данные уйдут не туда.
  2. Полный гейт: не монтировать в проде —
     `{process.env.NODE_ENV !== "production" && <ApiUrlSwitcher/>}` в `layout.tsx`. Дополнительно
     в `apiUrlManager.getApiUrl()` игнорировать localStorage-override при `NODE_ENV === "production"`
     (чтобы ранее сохранённый override не активировался). Хоткей/override — только non-prod.
- **Критерий приёмки**: прод-сборка не содержит панель в DOM; Ctrl+Shift+A не работает;
  `getApiUrl()` в проде всегда возвращает `NEXT_PUBLIC_API_URL`; в dev — как раньше.

### T-9. Перенести `EMAIL_VERIFICATION_SETUP.md` в `docs/`
- **Фаза**: 0
- **Приоритет**: P2
- **Трудоёмкость**: S
- **Риск**: low.
- **Зависимости**: нет
- **Файлы**: `EMAIL_VERIFICATION_SETUP.md` (корень) → `docs/EMAIL_VERIFICATION_SETUP.md`.
- **Что сделать**: единственный `.md` в корне кроме `README.md`. Остальная email-документация уже в
  `docs/` (`EMAIL_VERIFICATION_API.md`, `EMAIL_TEMPLATES_GUIDE.md`). Перенести; проверить ссылки.
- **Критерий приёмки**: файл в `docs/`; корень содержит только `README.md`.

---

### Фаза 1 — общие абстракции (делать ДО декомпозиции страниц)

### T-10. `src/shared/lib/formatters.ts` — единые форматтеры
- **Фаза**: 1
- **Приоритет**: P0 (фундамент для декомпозиции страниц)
- **Трудоёмкость**: M
- **Риск**: medium — у дублей разные локали/опции; единые функции должны сохранить вывод.
- **Зависимости**: T-12 (тесты сразу после)
- **Файлы**: создать `src/shared/lib/formatters.ts`, реэкспорт из `src/shared/lib/index.ts`.
  Call-sites (по grep `format[A-Z]`/`toLocaleString`/`Intl.`):
  - `formatCurrency` (USD, `Intl.NumberFormat("en-US")`): `settings/usage/page.tsx:58`, `admin/billing/page.tsx:69`.
  - `formatCompact` (K/M): `admin/billing/page.tsx:80`.
  - `formatDate` (`ru-RU`, разные опции — СВЕРИТЬ): `settings/usage/page.tsx:69`,
    `integrations/telegram/stats/page.tsx:47`, `integrations/telegram/sessions/[sessionId]/page.tsx:23`,
    `users/[userId]/conversations/[conversationId]/page.tsx:50`, `users/[userId]/page.tsx:48`,
    `avatars/[avatarId]/sessions/page.tsx:135`, `admin/audit/page.tsx:60`,
    `admin/requests/_components/PlanRequestDetailDialog.tsx:97`, `admin/users/page.tsx:50`,
    `admin/requests/page.tsx:154`, `settings/notifications/page.tsx:200` (inline).
  - `formatTime`/`formatRelativeTime`: `sessions/[sessionId]/page.tsx:34`,
    `conversations/[conversationId]/page.tsx:61,69`, `users/page.tsx:44`, `users/[userId]/page.tsx:59`,
    `integrations/telegram/sessions/page.tsx:22`.
  - `formatResponseTime` (ms): `integrations/telegram/stats/page.tsx:41`.
  - `formatFileSize`/bytes: `avatars/[avatarId]/documents/page.tsx:229`.
  - `formatCooldown`/`formatTime` (mm:ss) → выделить `formatDuration`: `verify-email/page.tsx:90`,
    `ResendVerificationButton.tsx:52`, `settings/notifications/page.tsx:430` (см. T-13).
  - inline `toLocaleString()` (десятки мест) → `formatNumber`.
- **Что сделать**: спроектировать `formatDate(date, opts?)`, `formatDateTime`, `formatRelativeTime`,
  `formatCurrency`, `formatCompact`, `formatNumber`, `formatBytes`, `formatDuration(seconds)`.
  Перед заменой каждого дубля сверить опции: у `formatDate` в `usage` локаль `ru-RU` + `month:"long"`,
  а в `users/[userId]` — `month:"short"` + время; нужны параметры или несколько именованных функций.
  Заменять страницы пакетами.
- **Критерий приёмки**: tsc/lint зелёные; даты/суммы визуально не изменились; локальных `function formatX`
  в `src/app` не осталось (кроме доменно-специфичных).

### T-11. `usePagination` + `<PaginationControls>` (skip/limit + page state)
- **Фаза**: 1
- **Приоритет**: P1
- **Трудоёмкость**: M
- **Риск**: low-medium.
- **Зависимости**: T-7 (`PAGE_SIZE`), T-12 (тесты)
- **Файлы**: создать `src/shared/lib/usePagination.ts` и/или `src/shared/ui/pagination-controls.tsx`.
  Call-sites: `admin/billing/page.tsx` (101,125-127,364-401), `projects/[id]/users` (354),
  `admin/notifications/logs` (453), `integrations/telegram/sessions` (219).
- **Что сделать**: таблицы однотипны по пагинации (skip = page*PAGE_SIZE, total, Назад/Вперёд,
  `page+1 / totalPages`), но данные разные → **хук** `usePagination({ total })` →
  `{ page, skip, limit, totalPages, hasNext, hasPrev, next, prev, setPage, reset }` + лёгкий
  presentational `<PaginationControls>`. Generic `<DataTable>` НЕ делать — колонки/ячейки слишком
  разные (badge/progress/действия); оставляем композицию shadcn Table + общий хук.
- **Критерий приёмки**: пагинация на 4 страницах работает как раньше; boilerplate удалён.

### T-12. Инфраструктура тестов (Vitest + RTL + MSW) + тесты на абстракции Фазы 1
- **Фаза**: 1
- **Приоритет**: P1
- **Трудоёмкость**: L
- **Риск**: medium — настройка окружения (Tailwind v4, ESM, Next).
- **Зависимости**: T-10, T-11 (есть что тестировать)
- **Файлы**: `vitest.config.ts`, `src/test/setup.ts`, `package.json` (скрипт `test`); тесты рядом с модулями.
- **Что сделать**: НЕ покрывать всё. 5–10 ценных целей:
  1. `shared/api/apiClient.ts` — refresh (proactive+reactive), очередь `failedQueue`,
     `ApiError`-трансформация, `onTokenLimitError`.
  2. `shared/lib/formatters.ts` — все функции (границы, локаль).
  3. `usePagination` — переходы страниц, `reset` при смене фильтра.
  4. query-key factories — стабильность ключей.
  5. zod-схемы (`features/auth/lib/validation.ts`).
  6. `middleware.ts` — `parseJwtPayload` + admin-гейт.
  7. `useChat` — sendMessage с temp-message и откатом при ошибке.
  Smoke-тесты страниц — позже.
- **Критерий приёмки**: `npm run test` зелёный; CI (T-1) добавляет шаг `test`.

### T-13. Cooldown/countdown-хук `useCountdown` (dedup email-верификации)
- **Фаза**: 1
- **Приоритет**: P1 (новый код после мержа f0, дублирование свежее)
- **Трудоёмкость**: S
- **Риск**: low.
- **Зависимости**: T-10 (`formatDuration`)
- **Файлы**: создать `src/shared/lib/useCountdown.ts` (или взять готовый из
  `settings/notifications/page.tsx:338` — там уже хороший `useCountdown` со `start/stop` и ref).
  Изменить: `src/app/(auth)/verify-email/page.tsx`, `src/features/auth/ui/ResendVerificationButton.tsx`,
  `src/app/(dashboard)/settings/notifications/page.tsx`.
- **Что сделать**: дублирование, добавленное мержем f0:
  - `formatCooldown(seconds)` (mm:ss) объявлен **дословно** в `verify-email/page.tsx:90` и
    `ResendVerificationButton.tsx:52`; `formatTime` (mm:ss) — в `settings/notifications/page.tsx:430`.
    → единый `formatDuration` (T-10).
  - cooldown-`useEffect` (`setInterval(() => setCooldown(c => c-1), 1000)`) повторён в
    `verify-email/page.tsx:43-51` и `ResendVerificationButton.tsx:42-50`; похожий `useCountdown` уже
    есть в notifications. → единый `useCountdown` в `shared/lib`, переиспользовать в трёх местах.
  - обработка `AUTH_EMAIL_RESEND_COOLDOWN` (чтение `details.wait_seconds`, дефолт 300) дублируется
    в обоих email-компонентах → вынести helper рядом с resend-логикой.
  - попутно: `verify-email/page.tsx:197-203` использует сырой `<input>` вместо shared `Input` — заменить.
- **Критерий приёмки**: один `useCountdown` и один `formatDuration`; verify-email и кнопка работают как
  прежде (таймер, дизейбл, тосты); tsc/lint зелёные.

### T-14. `<ConfirmDialog>` — замена `window.confirm` и одиночного `AlertDialog`
- **Фаза**: 1
- **Приоритет**: P1
- **Трудоёмкость**: M
- **Риск**: low.
- **Зависимости**: нет
- **Файлы**: создать `src/shared/ui/confirm-dialog.tsx` (на shadcn `AlertDialog`).
  Нативный `window.confirm` (блокирующий, нестилизованный): `settings/notifications/page.tsx:187`,
  `projects/[id]/settings/secrets/page.tsx:133`, `projects/[id]/members/page.tsx:405`,
  `avatars/[avatarId]/documents/page.tsx:208`, `admin/settings/platform/page.tsx:126`.
  Плюс единственный `AlertDialog` в `admin/requests/page.tsx`.
- **Что сделать**: `<ConfirmDialog title description confirmLabel variant onConfirm isPending>` или хук
  `useConfirm()` (удобнее для замены `window.confirm`). Заменить 5 нативных + унифицировать AlertDialog.
- **Критерий приёмки**: ни одного `window.confirm` в `src/app`; диалоги стилизованы; действия работают.

### T-15. `<StatusBadge>` — маппинги статусов в один компонент
- **Фаза**: 1
- **Приоритет**: P2
- **Трудоёмкость**: M
- **Риск**: low.
- **Зависимости**: нет
- **Файлы**: создать `src/shared/ui/status-badge.tsx`. Дубли variant-маппинга `status → цвет/лейбл`
  (~10 файлов): `users/[userId]/page.tsx` (active/blocked/archived), `users/page.tsx`,
  conversation status (active/ended), `admin/settings/telegram-notifications/page.tsx:438`
  (локальный `function StatusBadge`), telegram integration (`is_active`), plan-request статусы.
- **Что сделать**: per-domain конфиг (`endUserStatus`, `conversationStatus`, `planRequestStatus`, ...)
  → `<StatusBadge domain="endUser" value={status} />`. Рус.-лейблы в конфиг.
- **Критерий приёмки**: бейджи выглядят как раньше; локальные `StatusBadge` и инлайн-тернарники удалены.

---

### Фаза 2 — декомпозиция страниц (по одной странице = одна задача)

Целевой паттерн: специфичные блоки → `_components/` рядом со страницей (как
`admin/requests/_components/`, `projects/[id]/users/_components/`); переиспользуемое → `shared/ui` или
`features/<домен>/ui`. Ориентир для `page.tsx`: **≤150 строк**. Все диалоги/таблицы/формы Фазы 2
опираются на абстракции Фазы 1.

### T-16. Декомпозиция `projects/[id]/users/[userId]/page.tsx` (752)
- **Фаза**: 2 | **Приоритет**: P1 | **Трудоёмкость**: L | **Риск**: medium | **Зависимости**: T-10, T-15
- **Файлы**: создать в `users/[userId]/_components/`: `UserHeader.tsx` (кружок, имя, статус-бейдж,
  кнопки Написать/Блок/Разблок), `UserIdentitiesCard.tsx` (+ helpers `getProviderIcon/Label` →
  `entities/end-user/lib`), `UserStatsCard.tsx`, `UserTagsCard.tsx` (теги add/remove/save),
  `UserLimitsCard.tsx` (4 лимита с Progress + save), `UserNotesCard.tsx`, `UserRecentConversations.tsx`.
  `page.tsx` — use(params), хуки данных, состояние диалогов, композиция.
- **Что сделать**: попутно починить `useState(()=>{...})` (133) и `setState` в рендере (148-153) —
  см. T-3; инициализацию форм на `key`/`defaultValues`. `formatDate`/`formatRelativeTime` → `shared/lib`.
- **Критерий приёмки**: `page.tsx` ≤150; tsc/lint зелёные; теги/лимиты/заметки сохраняются; блок/разблок;
  диалоги работают.

### T-17. Декомпозиция `settings/usage/page.tsx` (716)
- **Фаза**: 2 | **Приоритет**: P1 | **Трудоёмкость**: L | **Риск**: low | **Зависимости**: T-10
- **Файлы**: `settings/usage/_components/`: `UsageSummaryCards.tsx` (4 карточки),
  `TokenUsageCard.tsx` (объединить почти одинаковые Chat/Embedding в один параметризованный),
  `UsageBreakdownTabs.tsx` (4 вкладки идентичных таблиц → одна `BreakdownTable` с конфигом колонок),
  `PlanInfoCard.tsx`, `PlanUpgradeDialog.tsx`.
- **Что сделать**: 4 вкладки breakdown (operation/model/project/avatar) — копипаста таблицы → одна
  таблица + конфиг. `formatCurrency` → shared.
- **Критерий приёмки**: `page.tsx` ≤150; график, вкладки, диалог апгрейда работают.

### T-18. Декомпозиция `admin/billing/page.tsx` (709)
- **Фаза**: 2 | **Приоритет**: P1 | **Трудоёмкость**: L | **Риск**: medium | **Зависимости**: T-10, T-11
- **Файлы**: `admin/billing/_components/`: `PlatformStatsCards.tsx`, `UsersByPlanCard.tsx`,
  `UsersUsageTable.tsx` (таблица + `usePagination`),
  `UserManageDialog.tsx` (инлайн-компонент, строки 418-708, 4 вкладки: лимиты/план/бонусы/сброс — вынести).
- **Что сделать**: `UserManageDialog` имеет `set-state-in-effect` (449-456) — починить (T-3).
  `formatCurrency`/`formatCompact` → shared. Пагинация → `usePagination`.
- **Критерий приёмки**: `page.tsx` ≤150; фильтр по плану, пагинация, управление пользователем работают.

### T-19. Декомпозиция `projects/[id]/integrations/telegram/page.tsx` (680)
- **Фаза**: 2 | **Приоритет**: P1 | **Трудоёмкость**: L | **Риск**: medium | **Зависимости**: T-14
- **Файлы**: `integrations/telegram/_components/`: `TelegramStatusCard.tsx` (статус, webhook-кнопки,
  webhook URL, выбранный аватар), `TelegramNavCards.tsx` (Статистика/Сессии), `TelegramSetupForm.tsx`
  (токен + аватар + welcome + is_active + расширенные настройки + create/update/delete).
- **Что сделать**: убрать хак `setTimeout(...,0)` внутри `useEffect` (строка 79) — обход StrictMode;
  инициализацию формы на `key`/`defaultValues` (T-3). Delete-диалог → `<ConfirmDialog>` (T-14).
  `cleanToken` → `entities/telegram/lib`.
- **Критерий приёмки**: `page.tsx` ≤150; create/update/delete интеграции и webhook работают; нет `setTimeout`-хака.

### T-20. Декомпозиция `settings/notifications/page.tsx` (544)
- **Фаза**: 2 | **Приоритет**: P2 | **Трудоёмкость**: M | **Риск**: low | **Зависимости**: T-13, T-14
- **Файлы**: уже разбита на локальные компоненты в одном файле — вынести в
  `settings/notifications/_components/`: `TelegramNotLinkedCard.tsx`, `TelegramLinkedCard.tsx`,
  `NotificationTypesCard.tsx`, `LinkTelegramModal.tsx`. `useCountdown` (338) → `shared/lib` (T-13).
  `window.confirm` (187) → `<ConfirmDialog>` (T-14).
- **Критерий приёмки**: `page.tsx` ≤120; привязка/отвязка/переключение уведомлений работают.

### T-21. Декомпозиция `admin/settings/telegram-notifications/page.tsx` (461) и `admin/notifications/logs/page.tsx` (453)
- **Фаза**: 2 | **Приоритет**: P2 | **Трудоёмкость**: M | **Риск**: low | **Зависимости**: T-11, T-15
- **Файлы**:
  - telegram-notifications: `_components/AdminBotCard.tsx` (99), `UserBotCard.tsx` (273); локальный
    `StatusBadge` (438) → общий `<StatusBadge>` (T-15).
  - notifications/logs: `_components/LogRow.tsx` (303), `LogDetailsModal.tsx` (351); таблица логов +
    пагинация → `usePagination` (T-11).
- **Критерий приёмки**: обе `page.tsx` ≤150; списки и модалки работают.

### T-22. Декомпозиция остальных страниц 350–460 строк
- **Фаза**: 2 | **Приоритет**: P2 | **Трудоёмкость**: XL (дробить по странице) | **Риск**: low-medium
- **Зависимости**: T-10..T-15
- **Файлы** (каждая — отдельная под-задача, паттерн `_components/`):
  - `avatars/[avatarId]/page.tsx` (451) — форма настроек (`set-state-in-effect`, T-3).
  - `users/[userId]/conversations/[conversationId]/page.tsx` (446) — лента сообщений.
  - `members/page.tsx` (422) — локальные `AddMemberForm`/`EditMemberForm`/`PermissionCheckboxes`/
    `RemoveMemberButton` → `_components/`; `window.confirm` (405) → T-14.
  - `projects/[id]/settings/page.tsx` (408) — `set-state-in-effect` (43), T-3.
  - `admin/requests/page.tsx` (399) — таблица заявок (детальный диалог уже в `_components/`).
  - `avatars/[avatarId]/documents/page.tsx` (373) — `window.confirm` (208) → T-14; `formatFileSize` → T-10.
  - `avatars/new/page.tsx` (372), `settings/secrets/page.tsx` (371, `window.confirm` 133 → T-14),
    `avatars/[avatarId]/chat/page.tsx` (365; дубль-импорт + `<img>` → T-3/T-26; `ReactMarkdown` → T-27),
    `users/page.tsx` (354; `self-closing` 208 → T-3).
- **Что сделать**: каждую страницу — отдельным PR/сессией. Дробить по смыслу, не «по 100 строк».
- **Критерий приёмки**: каждая затронутая `page.tsx` ≤150–180; функциональность сохранена; CI зелёный.

---

### Фаза 3 — auth/токены

### T-23. Единый `shared/lib/tokenStorage.ts` + синхронизация cookie при рефреше (security-критично)
- **Фаза**: 3
- **Приоритет**: P0 (исправляет рассинхрон → ложные разлогины / залипание старого токена)
- **Трудоёмкость**: M-L
- **Риск**: high — затрагивает весь auth-флоу; проверять login/refresh/logout/401 руками.
- **Зависимости**: T-12 (тесты на apiClient)
- **Файлы**: создать `src/shared/lib/tokenStorage.ts`; изменить `src/shared/api/apiClient.ts`
  (`tokenManager`, оба пути рефреша), `src/entities/auth/api/authApi.ts` (login/refresh/logout),
  `middleware.ts` (имя cookie согласовать, логику не менять).
- **Что сделать** (фактическая схема, подтверждённая кодом):
  - **localStorage** (`apiClient.ts:10-12,58-107`): `auth_token`, `auth_refresh_token`, `auth_expires_at`.
    Пишет `tokenManager.setTokens` (из `authApi.login/refresh` и из ОБОИХ путей рефреша интерсептора, 210, 292).
  - **cookie** `access_token` (для middleware, НЕ httpOnly): пишется **только** в `authApi.ts` через
    `document.cookie` — login (34), refresh (84), logout-clear (68).
  - **Баг рассинхрона**: интерсептор `apiClient` при собственном рефреше (proactive 209-215;
    reactive 401 291-303) обновляет ТОЛЬКО localStorage (`tokenManager.setTokens`), **не cookie**.
    `authApi.refresh()` (который обновляет cookie) интерсептором не используется — он шлёт свой
    `axios.post('/auth/refresh')` (`refreshTokens`, 132-138). Итог: после авто-рефреша localStorage
    свежий, а cookie держит старый/протухший access_token → middleware видит протухший токен и для
    admin-гейта парсит устаревший `role` через `atob` без верификации.
  - **Целевая схема (без бекенда, вариант «б»)**: единый `tokenStorage` — единственная точка записи и
    localStorage, и non-httpOnly cookie `access_token` (одно значение, одинаковый
    `max-age`/`SameSite=Lax`/`Secure`). `tokenManager.setTokens`/`clearTokens` делегируют в `tokenStorage`,
    который атомарно обновляет ОБА хранилища. Тогда любой путь рефреша синхронизирует cookie.
  - **Рассинхрон-обработка**: при 401 на рефреше (`apiClient.ts:304-313`) чистятся оба хранилища
    (через `clearTokens` → теперь и cookie). Ветка «cookie протух, localStorage жив»: middleware
    редиректит на login, клиент при первом 401 рефрешится и перезапишет cookie — после фикса согласовано.
  - **Вариант «а» (httpOnly cookie от бекенда + убрать localStorage)** — «после правок API»: refresh
    сейчас идёт телом (`{ refresh_token }`), токен доступен JS → httpOnly без бекенда невозможен.
    Зафиксировать зависимость.
- **Критерий приёмки**: после авто-рефреша cookie `access_token` = новому токену (DevTools → Application);
  logout чистит localStorage и cookie; 401-флоу не зацикливается; тесты apiClient (T-12) зелёные;
  вход в admin-роуты работает по свежей роли.

---

### Фаза 4 — типы из OpenAPI

### T-24. Внедрить `openapi-typescript` (только типы) + мигрировать 1 entity как образец
- **Фаза**: 4
- **Приоритет**: P2
- **Трудоёмкость**: L
- **Риск**: medium — расхождения сгенерированных типов с ручными.
- **Зависимости**: T-1 (CI), T-2 (контрактный баг ProjectUsage уже всплыл)
- **Файлы**: `package.json` (devDep `openapi-typescript` + скрипт `gen:api`),
  сгенерированный `src/shared/types/api/generated.ts` (по `docs/openapi.json`); образец — одна entity
  (рекомендуется `billing` или `project`).
- **Что сделать**:
  - Сейчас: 14 ручных файлов `src/shared/types/api/*.types.ts` против `docs/openapi.json` (67 схем).
    Расхождения подтверждены: `ProjectUsage` содержит несуществующие в openapi поля (T-2); схемы
    использования в openapi называются `UsageStatsResponse`/`DailyUsage`/`UsageTrend`.
  - Выбор: **`openapi-typescript`** (только типы), НЕ `orval` — query-key factories и хуки уже работают;
    orval = ненужная большая миграция. Codegen — **по ручной команде** `npm run gen:api` при изменении
    openapi, НЕ на каждый build (сервер 3.8 GB).
  - Образец: заменить ручные интерфейсы на `import type { components }` + алиасы
    (`type ProjectResponse = components["schemas"]["ProjectResponse"]`). Прогон tsc выявит фактические
    расхождения с бекендом — исправить call-sites.
- **Критерий приёмки**: `npm run gen:api` генерирует типы; одна entity использует сгенерированные;
  tsc зелёный; остальные entity — backlog (по одной = задача).

---

### Фаза 5 — RSC / перфоманс

### T-25. RSC-миграция read-mostly страниц (опционально, после auth)
- **Фаза**: 5
- **Приоритет**: P2
- **Трудоёмкость**: XL (по странице)
- **Риск**: medium.
- **Зависимости**: T-23 (cookie-токен обязателен для серверного фетча)
- **Файлы**: кандидаты — `admin/*`-списки, `settings/usage`, `admin/billing` (read-mostly).
- **Что сделать**: сейчас весь `(dashboard)` — `"use client"` (112 файлов с директивой), RSC/серверного
  фетча нет. Токен в localStorage блокирует серверный фетч — поэтому RSC возможен только ПОСЛЕ T-23
  (когда access_token доступен серверу через cookie). Мигрировать выборочно: страница-RSC грузит данные
  на сервере (через cookie), интерактивные блоки остаются client-компонентами в `_components/`.
  Не делать тотально — большинство страниц интерактивны с первого рендера.
- **Критерий приёмки**: выбранные admin-списки рендерятся на сервере; First Load JS этих роутов меньше;
  интерактив сохранён.

### T-26. `next/dynamic` для recharts и react-markdown + сужение `images.remotePatterns`
- **Фаза**: 5
- **Приоритет**: P1 (recharts грузится статически, крупнейший чанк ~331KB)
- **Трудоёмкость**: M
- **Риск**: low.
- **Зависимости**: нет (часть про Image — нужны реальные хосты)
- **Файлы**: обёртки чартов (`shared/ui/usage-chart.tsx`, `token-counter.tsx`, `usage-progress-bar.tsx`),
  `avatars/[avatarId]/chat/page.tsx:6` (ReactMarkdown); `next.config.ts` (`remotePatterns`, строки 8-15).
- **Что сделать**:
  - `next/dynamic` в проекте **не используется нигде** (grep подтвердил). Recharts и react-markdown
    импортируются статически. Обернуть тяжёлые чарты в `dynamic(() => import(...), { ssr: false,
    loading: Skeleton })`; ReactMarkdown — `dynamic` (нужен только на странице чата). Топ static-чанков:
    331KB/269KB/219KB (вероятно recharts + radix + next), суммарно `.next/static` = 3.7 MB.
  - `images.remotePatterns: hostname: "**"` — слишком широко. Картинки аватаров рендерятся через `<img>`
    (не `next/Image`), поэтому remotePatterns пока не задействован; при миграции `<img>` → `next/Image`
    (lint-warnings в `AvatarCard`, chat-page, telegram-page) сузить до реальных хостов бекенд-стораджа.
- **Критерий приёмки**: build проходит; recharts-чанк не в общем First Load; usage/analytics показывают
  скелетон чарта; `hostname: "**"` заменён списком (после миграции на Image).

### T-27. Санитизация markdown в чате
- **Фаза**: 5
- **Приоритет**: P2 (риск low — react-markdown v10 безопасен по умолчанию)
- **Трудоёмкость**: S
- **Риск**: low.
- **Зависимости**: нет
- **Файлы**: `avatars/[avatarId]/chat/page.tsx:318` (`<ReactMarkdown>{message.content}</ReactMarkdown>`).
- **Что сделать**: подтверждено — `ReactMarkdown` без `rehype-raw`, сырой HTML экранируется
  (XSS-поверхность низкая); `dangerouslySetInnerHTML` в проекте нет. Для явности добавить
  `rehype-sanitize` и ограничить разрешённые элементы, либо документировать намеренное отключение raw-HTML.
- **Критерий приёмки**: рендер markdown сохранён; HTML в сообщении не исполняется (кейс `<img onerror>`).

### T-28. Безопасные обновления зависимостей
- **Фаза**: 5
- **Приоритет**: P2
- **Трудоёмкость**: S-M
- **Риск**: low (патчи/миноры), high для мажоров — мажоры НЕ трогать.
- **Зависимости**: T-1 (CI ловит регрессии)
- **Файлы**: `package.json`, lock.
- **Что сделать** (по `npm outdated`): безопасные миноры/патчи — `@tanstack/react-query` 5.90→5.101,
  `axios` 1.13→1.17, `zod` 4.3→4.4, `react-hook-form` 7.70→7.77, `recharts` 3.6→3.8, radix-патчи,
  `@typescript-eslint/*` 8.51→8.60, `tailwindcss`/`@tailwindcss/postcss` 4.1→4.3, `prettier` 3.7→3.8.
  **НЕ трогать мажоры**: `next` 16.1→16.2 (минор, осторожно — отдельно), `eslint` 9→10,
  `typescript` 5.9→6, `lucide-react` 0.562→1.x, `react-dropzone` 14→15, `@types/node` 20→25.
  Группами, после каждой — tsc/lint/build/test.
- **Критерий приёмки**: CI зелёный; UI без регрессий.

### T-29. Обновить адреса сервера деплоя (Makefile)
- **Фаза**: 0/5 (инфра, можно рано) | **Приоритет**: P2 | **Трудоёмкость**: S | **Риск**: low | **Зависимости**: нет
- **Файлы**: `Makefile` (строки 2-3 комментарии `83.217.221.77`/`admin.parmenid.tech`; 46, 60 —
  echo-адреса; 67, 75 — домен в SSL-таргетах); `scripts/init-ssl.sh`.
- **Что сделать**: деплой → `95.140.159.9`. Обновить IP/домен в Makefile и SSL-скриптах, сверить
  `docker-compose.prod.yml`/nginx. `.dockerignore` полный (node_modules, .next, env) — ок;
  Dockerfile multi-stage/standalone корректен — не менять.
- **Критерий приёмки**: в Makefile нет старого IP/домена; `make help` показывает актуальные адреса.

### T-30. Точечная чистка мёртвого кода (knip)
- **Фаза**: 0 | **Приоритет**: P2 | **Трудоёмкость**: S | **Риск**: low | **Зависимости**: нет
- **Файлы**: knip-«unused files»: `src/entities/index.ts`, `src/features/index.ts`,
  `src/shared/types/index.ts` — проверить, что не импортируются; если нет ссылок — удалить.
  Unlisted dep: `@radix-ui/react-visually-hidden` (`shared/ui/sheet.tsx:6`) — добавить в `package.json`.
- **Что сделать**: остальные 166 «unused exports» НЕ трогать оптом — преимущественно barrel public-API
  (`entities/<x>/index.ts`, shadcn-реэкспорты `shared/ui`), ложноположительны. Лишние `shared/ui`-компоненты
  чистить только если очевидно мёртвые.
- **Критерий приёмки**: tsc/lint/build зелёные; `@radix-ui/react-visually-hidden` в deps.

---

## 4. Что сознательно НЕ делаем и почему

1. **Не переписываем на `orval`/полный codegen хуков.** Слой данных (api-функции + TanStack-хуки +
   query-key factories) написан руками, единообразен и работает. `openapi-typescript` (только типы) —
   минимальное вмешательство; orval сломал бы рабочий паттерн.
2. **Не делаем тотальную миграцию на RSC.** Токен в localStorage блокирует серверный фетч; RSC осмыслен
   только после Фазы 3 (cookie-токен) и выборочно для read-mostly страниц. Не раньше и не для всех.
3. **Не вводим generic `<DataTable>`.** Таблицы различаются ячейками (badge/progress/действия) — общий
   компонент переусложнится. Достаточно `usePagination` + `<PaginationControls>` + композиция shadcn Table.
4. **Не трогаем FSD-структуру и иерархию слоёв.** Архитектура здорова, кросс-импортов между entities нет —
   план усиливает существующие паттерны (`_components/`, `entities/<x>/lib`), а не вводит новые.
5. **Не убираем `ignoreBuildErrors`/`ignoreDuringBuilds` из сборки.** Сервер слабый (3.8 GB) — проверки
   уезжают в CI (T-1). В сборке они остаются для скорости.
6. **Не лезем в дизайн-слой** (цвета/темы/типографика) — это `UI_REDESIGN_PLAN.md`. Берём только
   структурные пересечения: `@font-face`-дубли (ниже) и `ApiUrlSwitcher` (T-8).
7. **Не обновляем мажоры зависимостей** (next 16.2, eslint 10, typescript 6, lucide 1.x) — риск регрессий
   высок; только безопасные миноры/патчи (T-28).
8. **Не правим knip-«unused exports» массово.** Большинство (166) — публичные barrel-API и ложноположительны;
   чистим точечно (T-30).

### Структурное пересечение с дизайн-планом (координация, НЕ чинить здесь без согласования)

- **Двойной источник шрифтов**: `layout.tsx` загружает Playfair Display / Inter / JetBrains Mono через
  `next/font/google` (self-hosted, переменные `--font-heading/sans/mono`), а `globals.css:15-42`
  ДОПОЛНИТЕЛЬНО объявляет `@font-face` для тех же трёх семейств с прямыми ссылками на `fonts.gstatic.com`
  (по одному woff2-срезу на семейство, тогда как Playfair грузит 6 начертаний). Дубль-загрузка +
  render-blocking внешний запрос. Рекомендация для UI-плана: оставить только `next/font` (self-host),
  убрать `@font-face` из globals; `@theme inline` ссылается на семейства по имени — будет работать через
  переменные next/font.

---

## 5. Метрики до/после

### Замеры этой сессии (07.06.2026, новая база)

| Метрика | Значение (до) | Цель (после) |
|---------|---------------|--------------|
| `tsc --noEmit` ошибок | **11** (было 11; набор сменился: теперь `next.config.ts` + 10× `analytics/page.tsx`) | 0 |
| ESLint проблем | **40** (21 error + 19 warning; было 39 — +1) | 0 error |
| `console.*` | 18 | 0 (debug); только осознанные `warn/error` |
| `"use client"` файлов | 112 | без роста (RSC — отдельно, Фаза 5) |
| локальных форматтеров (`function formatX`) | ~24 объявления в ~20 файлах | 0 (всё в `shared/lib/formatters`) |
| нативных `window.confirm` | 5 | 0 (→ `<ConfirmDialog>`) |
| `next/dynamic` | 0 | recharts + react-markdown лениво |
| хардкод-hex | 126 | вне зоны (дизайн-план) |
| `dark:`-вариантов | 18 | вне зоны (дизайн-план) |
| `any` / TODO / тесты | 0 / 0 / **0** | 0 / 0 / ключевые модули покрыты |

### Крупнейшие файлы (строки) — цель `page.tsx` ≤150

| Файл | До | После (цель) |
|------|----|--------------|
| `design-system/page.tsx` | 790 | 0 в проде (T-5) |
| `projects/[id]/users/[userId]/page.tsx` | 752 | ≤150 (T-16) |
| `settings/usage/page.tsx` | 716 | ≤150 (T-17) |
| `admin/billing/page.tsx` | 709 | ≤150 (T-18) |
| `projects/[id]/integrations/telegram/page.tsx` | 680 | ≤150 (T-19) |
| `settings/notifications/page.tsx` | 544 | ≤120 (T-20) |
| `admin/settings/telegram-notifications/page.tsx` | 461 | ≤150 (T-21) |
| `admin/notifications/logs/page.tsx` | 453 | ≤150 (T-21) |
| `dashboard/page.tsx` (легаси mock) | 326 | удалён (T-4) |

### Сборка (`npx next build`, Turbopack, Next 16.1.1)

- Компиляция: **5.4s** (✓ Compiled successfully), генерация 22 static pages ~0.28s. Сборка лёгкая.
- Build warning: **`Unrecognized key(s): 'eslint'`** в `next.config.ts` (Next 16 убрал встроенный
  `next lint`) — чинится в T-2.
- Next 16 Turbopack-вывод **НЕ печатает First Load JS по роутам** (нет колонки размеров). Замер по
  `.next/static`: суммарно **3.7 MB** JS; топ-чанки **331KB / 269KB / 219KB / 118KB / 110KB**
  (крупнейший — вероятно recharts, грузится статически → цель T-26).
- В прод-бандл попадают мёртвые роуты `/dashboard` (T-4) и `/design-system` (T-5) — оба строятся как `ƒ`.

### Прочие подтверждённые факты (новая база vs старая)

- **CI отсутствует** (`.github/workflows` нет), git remote = GitHub (`MalikProtopopov/consuragfrontend`)
  → Actions реализуемы (T-1).
- **Auth-рассинхрон уточнён**: cookie `access_token` пишет только `authApi`; интерсептор `apiClient` при
  авто-рефреше обновляет localStorage, но НЕ cookie → cookie протухает (T-23). Cookie не httpOnly.
- **Новое после мержа f0**: email-верификация (`verify-email/page.tsx` 253, `ResendVerificationButton`
  119, `useVerifyEmail`/`useResendVerification` в `useAuth`, `verifyEmail`/`resendVerification` в `authApi`) —
  найдено свежее дублирование `formatCooldown` + cooldown-`useEffect` + обработки
  `AUTH_EMAIL_RESEND_COOLDOWN` между verify-email и кнопкой (T-13); `verify-email` использует сырой
  `<input>` вместо shared `Input`. `middleware.ts` корректно добавил `/verify-email` в AUTH_ROUTES.
- **Контрактный баг** `ProjectUsage` (поля chat/embedding-токенов отсутствуют в типе и в openapi) был
  скрыт `ignoreBuildErrors`, вскрыт через `tsc` (T-2).
- `Makefile` всё ещё указывает старый сервер `83.217.221.77` / `admin.parmenid.tech` (деплой → `95.140.159.9`), T-29.
- knip: 3 «unused files» (барреля верхнего уровня), 1 unlisted dep (`@radix-ui/react-visually-hidden`),
  166 «unused exports» — преимущественно ложные (FSD public-API / shadcn реэкспорты), T-30.

### Покрытие тестами (цель)

| Модуль | До | После |
|--------|----|-------|
| `shared/api/apiClient` (refresh/queue/ApiError) | 0 | покрыт |
| `shared/lib/formatters` | 0 | покрыт |
| `usePagination`, `useCountdown` | 0 | покрыт |
| query-key factories | 0 | покрыт |
| zod-схемы auth | 0 | покрыт |
| `middleware` (роль/редиректы) | 0 | покрыт |
| `useChat` (sendMessage/откат) | 0 | покрыт |
