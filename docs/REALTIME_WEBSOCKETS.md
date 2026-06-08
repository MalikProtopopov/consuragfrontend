# Real-time (WebSockets) — фронт-контракт и план

> Кросс-командный план перехода с polling на WebSocket/SSE. Полный план (ниже,
> «ЧАСТЬ B») — для **backend-команды**. Эта «ЧАСТЬ A» — рабочая выжимка для
> **фронтенда**: что фронт делает, чего ждёт от бэка, и текущее состояние.
>
> Статус на 2026-06-08: **фронт ждёт Phase 0 бэкенда** (generic `WS /api/v1/ws`,
> Redis-backplane, каналы, авторизация). Код фронта пока не трогаем.

═══════════════════════════════════════════════════════════
## ЧАСТЬ A. Фронтенд-сторона
═══════════════════════════════════════════════════════════

### A.1. Карта текущего polling во фронте (что заменяем)

Реально сейчас на фронте polling минимален (проверено grep `refetchInterval`):

| Где (фронт) | Что | Пункт плана | Чем заменить |
|---|---|---|---|
| `entities/document/model/useDocument.ts:34` | `refetchInterval` — поллит статус документа, пока `parsing_status` не `indexed`/`failed` | #2 Документы (P0) | подписка `document:{id}` / `avatar:{avatar_id}:documents`, снимать спиннер по `document.indexed` |
| `entities/notification/model/useNotification.ts:29-34` | опциональный `refetchInterval` у `useTelegramStatus` | — (не в списке плана) | по желанию оставить REST |

**Важно:** дашборды (usage / analytics / notifications-feed / заявки / end-users) на
фронте **сейчас НЕ поллят** — грузятся разово при навигации. То есть «живые дашборды»
из плана (#3–#8) — это **новый функционал**, а не замена существующего polling.
Появятся, когда бэк построит каналы; фронт добавит подписки точечно.

### A.2. Фронт-контракт (из §10 плана)

1. **Один WS на вкладку** для приватных каналов: `WS /api/v1/ws?token=<JWT>`,
   мультиплекс через `op:subscribe`/`op:unsubscribe`. Для **виджета чата** — отдельный
   `WS /api/v1/chat/ws/{avatar_id}` с `session_token` (без JWT).
2. **WS — это push поверх REST, не единственный источник истины.** После
   reconnect — заново `subscribe` + **догрузка пропущенного через REST**
   (фид/usage/документы/история чата).
3. **Reconnect с экспоненциальным backoff**; heartbeat: отвечать `pong` на серверный `ping`.
4. **UI переключается по `type` события** (реестр A.4).
5. Чат: typing по `chat.status`, дописывать текст по `chat.delta`, источники по
   `chat.citation`, финализация по `chat.done`, ошибки по `chat.error`.

### A.3. Envelope (из §4)

Клиент→сервер: `{ "op": "subscribe", "channel": "user:<id>:usage" }` ·
`{ "op": "unsubscribe", ... }` · `{ "op": "ping" }`.

Сервер→клиент: `{ "type": "...", "channel": "...", "data": {...}, "ts": "..." }` ·
`{ "type": "subscribed", "channel": "..." }` · `{ "type": "error", "code": "...", "message": "..." }` ·
`{ "type": "pong" }`.

### A.4. Реестр событий, на которые переключается UI (из §8)

| `type` | Канал | Где использует фронт |
|---|---|---|
| `chat.user_message`/`chat.status`/`chat.delta`/`chat.citation`/`chat.done`/`chat.error` | `chat:{session_id}` | тестовый чат аватара + виджет |
| `document.processing_started/parsed/chunked/indexed/failed` | `document:{id}`, `avatar:{avatar_id}:documents` | страница документов (снять спиннер/ошибка) |
| `notification.created` | `user:{user_id}:notifications` | колокольчик-поповер (live-бейдж) |
| `usage.tokens_consumed`/`usage.alert`/`usage.limit_exceeded`/`usage.plan_changed`/`usage.bonus_added` | `user:{user_id}:usage` | токен-виджет сайдбара + /settings/usage |
| `analytics.message`/`analytics.session`/`analytics.tokens`/`analytics.document_indexed` | `project:{project_id}:analytics` | обзор/аналитика проекта |
| `plan_request.created`/`plan_request.status_changed` | `admin:plan_requests` | /admin/requests |
| `enduser.created`/`conversation.started`/`enduser.message_in`/`enduser.message_out`/`enduser.blocked` | `project:{project_id}:endusers` | /projects/[id]/users, диалоги |
| `chat_monitor.session_created`/`chat_monitor.message`/`chat_monitor.session_ended` | `project:{project_id}:chat-monitor` | мониторинг сессий (админ) |

### A.5. Фронт-чеклист по фазам (делаем по мере готовности бэка)

**Фундамент (после бэк Phase 0):**
- [ ] `entities/realtime/` или `shared/lib/realtime/`: WS-клиент с мультиплексом,
      `subscribe/unsubscribe`, reconnect+backoff, heartbeat (`ping/pong`), очередь
      подписок на время дисконнекта.
- [ ] Хук `useRealtimeChannel(channel, onEvent)` — авто-subscribe при монтировании,
      авто-unsubscribe при размонтировании, авто-resubscribe после reconnect.
- [ ] Интеграция с React Query: по событию — `queryClient.invalidateQueries(...)`
      (тонкий payload + REST-refresh) ИЛИ `setQueryData(...)` (толстый payload) —
      см. открытый вопрос §11.1.
- [ ] Передача JWT в `?token=` + переподключение при refresh токена (reconnect-on-refresh).

**Фаза 1 (P0/P1):**
- [ ] Чат: перевести `useChat.sendMessage` с блокирующего `POST /message` на WS/SSE-стрим
      (`chat.status`→typing, `chat.delta`→дописывание, `chat.citation`, `chat.done`).
      Текущий `POST /message` оставить fallback. (Делать **после** заморозки протокола бэком — §6.1.)
- [ ] Документы: заменить `useDocument` `refetchInterval` на подписку `avatar:{avatar_id}:documents`.
- [ ] Уведомления: live-бейдж на колокольчике по `user:{id}:notifications`.
- [ ] Биллинг: live-обновление токен-виджета по `user:{id}:usage`.

**Фаза 2 (P2/P3):** live-аналитика проекта, заявки (админ), end-users/диалоги, мониторинг сессий.

### A.6. Что блокирует фронт (зависимости от бэка)

- 🔴 **Generic `WS /api/v1/ws` + Redis-backplane + каналы + авторизация** (бэк Phase 0) —
  без этого приватные каналы недоступны. **Главный блокер.**
- 🟡 **Заморозка протокола чат-стрима** (§6.1: единый набор `type`, паритет токенов/лимитов/Conversation)
  — до неё фронт-чат-стрим строить рискованно (переделка).
- 🟢 nginx upgrade для `/api/v1/ws`, heartbeat-политика, формат payload (§11) — согласовать.

### A.7. Открытые вопросы к согласованию (из §11) — влияют на фронт

1. **Payload дашбордов:** «тонкий» (фронт REST-refresh) vs «толстый» (готовые агрегаты).
   Фронт-рекомендация: **тонкий** + `invalidateQueries` — проще и согласуется с React Query.
2. **Долгий JWT на WS:** reconnect-on-refresh (фронт-предпочтение, просто).
3. **Прогресс документов в %:** достаточно стадий (`parsed/chunked/indexed`) для снятия
   спиннера; «живой %» — nice-to-have.

═══════════════════════════════════════════════════════════
## ЧАСТЬ B. Полный план (источник — backend-команда, референс)
═══════════════════════════════════════════════════════════

> Ниже — оригинальный backend-план (TL;DR, инвентаризация polling, целевая
> архитектура с Redis pub/sub backplane для multi-worker, новые модули
> `app/core/realtime/`, протокол, авторизация по каналам, детальный план по
> областям #1–#8, инфраструктура nginx/Redis/воркеры, реестр событий, чеклист по
> фазам, открытые вопросы, ссылки на код). Поддерживается backend-командой —
> при расхождении источник истины у них.

Ключевые опорные точки backend-плана (для фронта важно знать):
- **EventBus сейчас внутрипроцессный** (`app/core/events.py`, `asyncio.gather`, без Redis) —
  на 2 uvicorn-воркерах событие воркера A не видно воркеру B → обязателен **Redis pub/sub backplane**.
- **Redis pub/sub пока не используется** (`app/core/redis.py` — только cache) → нужен новый слой.
- **nginx апгрейдит только `/api/v1/chat/ws`** → под `/api/v1/ws` нужен новый `location` с Upgrade.
- **Все доменные события уже публикуются** через `EventBus.publish(...)` → WS-слой
  только подписывается и ретранслирует, бизнес-логику не переписывают.
- Авторизация WS: публичный чат — `session_token`; приватные каналы — **JWT** (`verify_token`).

Опорные файлы бэка: `chat/api/v1/routes/websocket.py` (WS/SSE), `chat/rag/agent.py`
(`generate_stream`), `core/events.py`, `core/redis.py`, `core/security.py` (`verify_token`),
`*/domain/events.py`, `nginx/nginx.conf.template:135-148`, `docker-compose.prod.yml`,
`documents/domain/models.py` (`DocumentStatus`) + `documents/tasks.py` (`process_document`),
`notifications/api/v1/routes/feed.py` + `notifications/service.py`.

Полная версия backend-плана (с кодовыми скелетами `ConnectionManager`,
`RedisEventBridge`, `channels_for_event`, авторизацией, чеклистом по фазам) —
у backend-команды (передана отдельным документом). Эта страница — фронтовый рабочий
контракт; обновлять при изменении протокола.
