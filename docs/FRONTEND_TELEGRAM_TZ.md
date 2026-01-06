# Техническое задание: Frontend для Telegram интеграции

**Дата:** 6 января 2026  
**Версия:** 1.0  
**Статус:** Готово к реализации  

---

## Содержание

1. [Обзор изменений](#обзор-изменений)
2. [Новые API endpoints](#новые-api-endpoints)
3. [Изменения в существующих API](#изменения-в-существующих-api)
4. [Новые экраны](#новые-экраны)
5. [Обновление существующих экранов](#обновление-существующих-экранов)
6. [Компоненты](#компоненты)
7. [Типы данных](#типы-данных)
8. [Приоритеты реализации](#приоритеты-реализации)

---

## Обзор изменений

### Что изменилось в Backend

| Изменение | Описание | Влияние на Frontend |
|-----------|----------|---------------------|
| Персистентные сессии | История чата сохраняется между сообщениями | Новый экран истории чатов |
| Rate limiting | Ограничение запросов per-user и per-bot | Отображение настроек, статистики |
| Команды /history, /clear | Пользователи могут управлять контекстом | Настройки вкл/выкл команд |
| TelegramSession модель | Отслеживание пользователей бота | Экран списка сессий |
| TelegramEvent модель | Логирование всех событий | Экран аналитики |
| Валидация webhook | Улучшенная безопасность | Статус безопасности |

---

## Новые API endpoints

### 1. Статистика

```
GET /api/v1/telegram/projects/{project_id}/telegram/stats
```

**Response:**
```typescript
interface TelegramStatsResponse {
  total_users: number;
  active_sessions: number;
  inactive_sessions: number;
  total_messages_today: number;
  total_messages_week: number;
  total_messages_month: number;
  avg_response_time_ms: number | null;
  rate_limit_events_today: number;
  error_events_today: number;
  stats_from: string; // ISO datetime
  stats_to: string; // ISO datetime
}
```

### 2. Список сессий

```
GET /api/v1/telegram/projects/{project_id}/telegram/sessions
```

**Query parameters:**
- `status`: "all" | "active" | "inactive" (default: "all")
- `search`: string (поиск по user_id или username)
- `skip`: number (default: 0)
- `limit`: number (1-100, default: 20)

**Response:**
```typescript
interface TelegramSessionListResponse {
  items: TelegramSessionResponse[];
  total: number;
  skip: number;
  limit: number;
}

interface TelegramSessionResponse {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_chat_id: number;
  project_id: string;
  chat_session_id: string | null;
  selected_avatar_id: string | null;
  is_active: boolean;
  messages_count: number;
  created_at: string;
  last_message_at: string;
}
```

### 3. Детали сессии

```
GET /api/v1/telegram/projects/{project_id}/telegram/sessions/{session_id}
```

**Query parameters:**
- `messages_limit`: number (1-200, default: 50)

**Response:**
```typescript
interface TelegramSessionDetailResponse {
  session: TelegramSessionResponse;
  messages: ChatMessageResponse[];
}

interface ChatMessageResponse {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: number;
  created_at: string;
}
```

### 4. Экспорт истории

```
GET /api/v1/telegram/projects/{project_id}/telegram/sessions/{session_id}/export
```

**Response:**
```typescript
interface SessionExportResponse {
  session: {
    id: string;
    telegram_user_id: number;
    telegram_username: string | null;
    created_at: string;
    last_message_at: string;
    messages_count: number;
  };
  messages: {
    role: string;
    content: string;
    tokens_used: number;
    created_at: string;
  }[];
  exported_at: string;
}
```

### 5. Список событий

```
GET /api/v1/telegram/projects/{project_id}/telegram/events
```

**Query parameters:**
- `event_type`: string (фильтр по типу)
- `skip`: number (default: 0)
- `limit`: number (1-200, default: 50)

**Response:**
```typescript
interface TelegramEventListResponse {
  items: TelegramEventResponse[];
  total: number;
  skip: number;
  limit: number;
}

interface TelegramEventResponse {
  id: string;
  event_type: string;
  telegram_user_id: number | null;
  telegram_chat_id: number | null;
  message_text: string | null;
  response_text: string | null;
  response_time_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  error_code: string | null;
  created_at: string;
}
```

---

## Изменения в существующих API

### GET/PUT /api/v1/telegram/projects/{project_id}/telegram

**Новые поля в response и request:**

```typescript
interface TelegramIntegrationResponse {
  // ... существующие поля ...
  
  // НОВЫЕ ПОЛЯ:
  session_timeout_hours: number;    // default: 12
  user_rate_limit: number;          // default: 10 (per minute)
  bot_rate_limit: number;           // default: 100 (per minute)
  rate_limit_window: number;        // default: 60 (seconds)
  enable_history_command: boolean;  // default: true
  enable_clear_command: boolean;    // default: true
}

interface TelegramIntegrationUpdate {
  // ... существующие поля ...
  
  // НОВЫЕ ПОЛЯ (опциональные):
  session_timeout_hours?: number;   // 1-168 (до 1 недели)
  user_rate_limit?: number;         // 1-100
  bot_rate_limit?: number;          // 10-1000
  rate_limit_window?: number;       // 10-300 секунд
  enable_history_command?: boolean;
  enable_clear_command?: boolean;
}
```

---

## Новые экраны

### 1. Страница статистики Telegram

**URL:** `/projects/{projectId}/integrations/telegram/stats`

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ ← Назад    Telegram Statistics                             │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ 👤 156   │  │ ✅ 23    │  │ 💬 1.2k  │  │ ⚡ 450ms │  │
│  │ Users    │  │ Active   │  │ Messages │  │ Avg Time │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                            │
│  Messages (Last 7 days)                                    │
│  ┌─────────────────────────────────────────────────────┐  │
│  │    ▄                                                │  │
│  │   ▄█   ▄                                           │  │
│  │  ▄██  ▄█▄  ▄                                       │  │
│  │ ▄███ ▄███ ▄█▄                                      │  │
│  │ ████ ████ ███                                      │  │
│  │ Mon  Tue  Wed  Thu  Fri  Sat  Sun                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │ Events Today        │  │ Commands Distribution       │ │
│  │ ────────────────    │  │ ┌─────────────────────────┐ │ │
│  │ Rate Limited: 5     │  │ │  /start 45%            │ │ │
│  │ Errors: 2           │  │ │  messages 50%          │ │ │
│  │                     │  │ │  /help 3%              │ │ │
│  └─────────────────────┘  │ │  other 2%              │ │ │
│                           │ └─────────────────────────┘ │ │
│                           └─────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**Компоненты:**
- `StatCard` - карточка с метрикой
- `MessagesChart` - график сообщений (line chart)
- `EventsPanel` - панель событий
- `CommandsPieChart` - круговая диаграмма команд

### 2. Страница списка сессий

**URL:** `/projects/{projectId}/integrations/telegram/sessions`

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ ← Назад    Telegram Conversations                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────┐  ┌───────────┐  │
│  │ 🔍 Search by user ID or username...  │  │ All ▼    │  │
│  └──────────────────────────────────────┘  └───────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ User ID     │ Username │ Messages │ Last Active │ St │ │
│  │─────────────┼──────────┼──────────┼─────────────┼────│ │
│  │ tg:123***   │ @john    │ 45       │ 2 hours ago │ 🟢 │ │
│  │ tg:456***   │ -        │ 12       │ 1 day ago   │ ⚪ │ │
│  │ tg:789***   │ @mary    │ 8        │ 3 days ago  │ ⚪ │ │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ ← Previous    Page 1 of 5    Next →    Export All   │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

**Функционал:**
- Таблица с пагинацией
- Фильтр по статусу (All/Active/Inactive)
- Поиск по user_id или username
- Кнопка экспорта всех сессий
- Клик по строке → детали сессии

### 3. Страница деталей сессии

**URL:** `/projects/{projectId}/integrations/telegram/sessions/{sessionId}`

**Wireframe:**
```
┌────────────────────────────────────────────────────────────┐
│ ← Back to Sessions                                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Session: tg:123456789                                     │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Username: @john_doe                                  │  │
│  │ First Name: John                                     │  │
│  │ Created: Jan 5, 2026 10:30 AM                       │  │
│  │ Last Message: Jan 6, 2026 2:15 PM                   │  │
│  │ Total Messages: 45                                   │  │
│  │ Status: 🟢 Active                                    │  │
│  │                                        [Export JSON] │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  Chat History                                              │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ 👤 User (10:30 AM)                                   │  │
│  │ Привет! Расскажи о продукте.                        │  │
│  │─────────────────────────────────────────────────────│  │
│  │ 🤖 Assistant (10:31 AM)                              │  │
│  │ Здравствуйте! Наш продукт помогает...               │  │
│  │ [245 tokens]                                         │  │
│  │─────────────────────────────────────────────────────│  │
│  │ 👤 User (10:32 AM)                                   │  │
│  │ А какие тарифы?                                     │  │
│  │─────────────────────────────────────────────────────│  │
│  │ ...                                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## Обновление существующих экранов

### Страница настроек Telegram интеграции

**Добавить новую секцию "Расширенные настройки":**

```
┌────────────────────────────────────────────────────────────┐
│ Telegram Integration Settings                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ Basic Settings                                             │
│ ─────────────────                                          │
│ Bot Token:     [••••••••••••••••••••••••]  [Show/Hide]    │
│ Bot Username:  @my_assistant_bot ✓                        │
│ Default Avatar: [Select Avatar ▼]                         │
│ Welcome Message: [_________________________]              │
│                                                            │
│ Webhook Status                                             │
│ ─────────────────                                          │
│ Status: 🟢 Connected                                       │
│ URL: https://api.example.com/webhook/...                  │
│ [Refresh Webhook]  [Copy URL]                              │
│                                                            │
│ ┌────────────────────────────────────────────────────┐    │
│ │ ⚙️ Advanced Settings                         [▼]    │    │
│ └────────────────────────────────────────────────────┘    │
│                                                            │
│ (При раскрытии:)                                           │
│                                                            │
│ Session Settings                                           │
│ ─────────────────                                          │
│ Session Timeout:    [12] hours (1-168)                    │
│ ℹ️ После этого времени создается новый контекст            │
│                                                            │
│ Rate Limiting                                              │
│ ─────────────────                                          │
│ User Rate Limit:    [10] messages per minute (1-100)      │
│ Bot Rate Limit:     [100] messages per minute (10-1000)   │
│ Rate Limit Window:  [60] seconds (10-300)                 │
│                                                            │
│ Bot Commands                                               │
│ ─────────────────                                          │
│ [✓] Enable /history command                               │
│ [✓] Enable /clear command                                 │
│                                                            │
│                                    [Save Changes]          │
└────────────────────────────────────────────────────────────┘
```

### Добавить навигацию к статистике

На странице интеграции добавить кнопки/ссылки:
- "View Statistics" → `/projects/{id}/integrations/telegram/stats`
- "View Conversations" → `/projects/{id}/integrations/telegram/sessions`

---

## Компоненты

### Новые компоненты для создания:

| Компонент | Описание | Использование |
|-----------|----------|---------------|
| `TelegramStatCard` | Карточка с метрикой | Страница статистики |
| `TelegramMessagesChart` | График сообщений | Страница статистики |
| `TelegramSessionsTable` | Таблица сессий | Список сессий |
| `TelegramChatHistory` | Отображение истории | Детали сессии |
| `TelegramAdvancedSettings` | Расширенные настройки | Настройки интеграции |
| `SessionExportButton` | Кнопка экспорта | Детали сессии |

### Рекомендуемые библиотеки:

- **Графики:** Recharts или Chart.js
- **Таблицы:** TanStack Table (react-table)
- **Экспорт:** file-saver для скачивания JSON

---

## Типы данных (TypeScript)

```typescript
// types/telegram.ts

export interface TelegramIntegration {
  id: string;
  project_id: string;
  bot_username: string | null;
  default_avatar_id: string | null;
  webhook_url: string | null;
  is_webhook_active: boolean;
  is_active: boolean;
  welcome_message: string | null;
  created_at: string;
  
  // New fields
  session_timeout_hours: number;
  user_rate_limit: number;
  bot_rate_limit: number;
  rate_limit_window: number;
  enable_history_command: boolean;
  enable_clear_command: boolean;
}

export interface TelegramIntegrationUpdate {
  bot_token?: string;
  default_avatar_id?: string;
  welcome_message?: string;
  is_active?: boolean;
  
  // New fields
  session_timeout_hours?: number;
  user_rate_limit?: number;
  bot_rate_limit?: number;
  rate_limit_window?: number;
  enable_history_command?: boolean;
  enable_clear_command?: boolean;
}

export interface TelegramSession {
  id: string;
  telegram_user_id: number;
  telegram_username: string | null;
  telegram_first_name: string | null;
  telegram_chat_id: number;
  project_id: string;
  chat_session_id: string | null;
  selected_avatar_id: string | null;
  is_active: boolean;
  messages_count: number;
  created_at: string;
  last_message_at: string;
}

export interface TelegramStats {
  total_users: number;
  active_sessions: number;
  inactive_sessions: number;
  total_messages_today: number;
  total_messages_week: number;
  total_messages_month: number;
  avg_response_time_ms: number | null;
  rate_limit_events_today: number;
  error_events_today: number;
  stats_from: string;
  stats_to: string;
}

export interface TelegramEvent {
  id: string;
  event_type: TelegramEventType;
  telegram_user_id: number | null;
  telegram_chat_id: number | null;
  message_text: string | null;
  response_text: string | null;
  response_time_ms: number | null;
  tokens_used: number | null;
  error_message: string | null;
  error_code: string | null;
  created_at: string;
}

export type TelegramEventType = 
  | 'message_received'
  | 'message_sent'
  | 'command_received'
  | 'rate_limited'
  | 'error'
  | 'session_created'
  | 'session_cleared'
  | 'webhook_invalid';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used: number;
  created_at: string;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export type TelegramSessionsResponse = PaginatedResponse<TelegramSession>;
export type TelegramEventsResponse = PaginatedResponse<TelegramEvent>;
```

---

## API Service (пример)

```typescript
// services/telegramApi.ts

import { api } from './api';
import type {
  TelegramIntegration,
  TelegramIntegrationUpdate,
  TelegramSession,
  TelegramStats,
  TelegramSessionsResponse,
  TelegramEventsResponse,
  ChatMessage,
} from '../types/telegram';

const BASE = '/telegram/projects';

export const telegramApi = {
  // Integration
  getIntegration: (projectId: string) =>
    api.get<TelegramIntegration>(`${BASE}/${projectId}/telegram`),
    
  updateIntegration: (projectId: string, data: TelegramIntegrationUpdate) =>
    api.put<TelegramIntegration>(`${BASE}/${projectId}/telegram`, data),
  
  // Stats
  getStats: (projectId: string) =>
    api.get<TelegramStats>(`${BASE}/${projectId}/telegram/stats`),
  
  // Sessions
  getSessions: (projectId: string, params?: {
    status?: 'all' | 'active' | 'inactive';
    search?: string;
    skip?: number;
    limit?: number;
  }) =>
    api.get<TelegramSessionsResponse>(`${BASE}/${projectId}/telegram/sessions`, { params }),
  
  getSession: (projectId: string, sessionId: string, messagesLimit = 50) =>
    api.get<{ session: TelegramSession; messages: ChatMessage[] }>(
      `${BASE}/${projectId}/telegram/sessions/${sessionId}`,
      { params: { messages_limit: messagesLimit } }
    ),
  
  exportSession: (projectId: string, sessionId: string) =>
    api.get(`${BASE}/${projectId}/telegram/sessions/${sessionId}/export`),
  
  // Events
  getEvents: (projectId: string, params?: {
    event_type?: string;
    skip?: number;
    limit?: number;
  }) =>
    api.get<TelegramEventsResponse>(`${BASE}/${projectId}/telegram/events`, { params }),
};
```

---

## Приоритеты реализации

| Приоритет | Задача | Оценка |
|-----------|--------|--------|
| P0 | Обновить форму настроек (новые поля) | 2-3 часа |
| P0 | Обновить типы TypeScript | 1 час |
| P1 | Страница статистики (без графиков) | 4-6 часов |
| P1 | Страница списка сессий | 4-6 часов |
| P1 | Страница деталей сессии | 3-4 часа |
| P2 | Графики на странице статистики | 4-6 часов |
| P2 | Экспорт истории | 2 часа |
| P3 | Страница событий (logs) | 4-6 часов |

**Общая оценка: 24-34 часа (3-4 дня)**

---

## Чеклист для Frontend разработчика

### До начала работы:
- [ ] Прочитать ТЗ полностью
- [ ] Обновить типы TypeScript из backend schemas
- [ ] Проверить доступ к новым API endpoints

### Основные задачи:
- [ ] Обновить интерфейс `TelegramIntegration` новыми полями
- [ ] Добавить секцию "Advanced Settings" в форму настроек
- [ ] Создать страницу `/projects/{id}/integrations/telegram/stats`
- [ ] Создать страницу `/projects/{id}/integrations/telegram/sessions`
- [ ] Создать страницу `/projects/{id}/integrations/telegram/sessions/{id}`
- [ ] Добавить навигацию между страницами
- [ ] Добавить фильтры и поиск в списке сессий
- [ ] Реализовать экспорт истории в JSON

### Тестирование:
- [ ] Проверить обновление настроек
- [ ] Проверить отображение статистики
- [ ] Проверить пагинацию сессий
- [ ] Проверить поиск и фильтры
- [ ] Проверить экспорт данных
- [ ] Проверить на мобильных устройствах

---

**Дата создания:** 6 января 2026  
**Версия:** 1.0  
**Статус:** ГОТОВО К РЕАЛИЗАЦИИ

