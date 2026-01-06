# Техническое задание: Биллинг и лимиты токенов (Frontend)

**Версия:** 1.0  
**Дата:** 5 января 2026  
**Автор:** Backend Team

---

## 1. Обзор функционала

В бэкенде реализована система лимитов токенов с гибридной моделью монетизации:
- Подписка с включенным пакетом токенов (FREE/STARTER/GROWTH/SCALE/ENTERPRISE)
- Раздельный учет токенов для чата и embeddings
- Уведомления при приближении к лимитам (80%, 90%, 100%)
- Административные функции для управления лимитами пользователей

---

## 2. Новые API Endpoints

### 2.1 Endpoints для OWNER (авторизованный пользователь)

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/v1/billing/usage/summary` | Сводка использования текущего периода |
| GET | `/api/v1/billing/usage/history?days=30` | История использования по дням |
| GET | `/api/v1/billing/usage/breakdown` | Детализация по проектам/аватарам |
| GET | `/api/v1/billing/limits` | Текущие лимиты и план |
| GET | `/api/v1/billing/plan` | Информация о текущем плане |

### 2.2 Endpoints для SAAS_ADMIN

| Method | Endpoint | Описание |
|--------|----------|----------|
| GET | `/api/v1/billing/admin/usage/platform` | Общее использование платформы |
| GET | `/api/v1/billing/admin/usage/users` | Использование по всем пользователям |
| GET | `/api/v1/billing/admin/users/{user_id}/usage` | Использование конкретного пользователя |
| GET | `/api/v1/billing/admin/users/{user_id}/budget` | Бюджет конкретного пользователя |
| PUT | `/api/v1/billing/admin/users/{user_id}/limits` | Изменить лимиты пользователя |
| PUT | `/api/v1/billing/admin/users/{user_id}/plan` | Изменить план пользователя |
| POST | `/api/v1/billing/admin/users/{user_id}/bonus-tokens` | Добавить бонусные токены |
| POST | `/api/v1/billing/admin/users/{user_id}/reset-period` | Сбросить период |

---

## 3. Схемы данных (TypeScript Types)

### 3.1 Сводка использования

```typescript
interface UsageSummary {
  plan: string;
  plan_features: string[];
  period_start: string; // ISO date
  period_end: string;
  days_remaining: number;
  
  // Chat tokens
  chat_tokens_limit: number;
  chat_tokens_used: number;
  chat_tokens_remaining: number;
  chat_bonus_tokens: number;
  chat_usage_percent: number;
  
  // Embedding tokens
  embedding_tokens_limit: number;
  embedding_tokens_used: number;
  embedding_tokens_remaining: number;
  embedding_bonus_tokens: number;
  embedding_usage_percent: number;
  
  // Combined
  total_tokens_used: number;
  total_usage_percent: number;
  
  // Overage - токены сверх лимита плана (оплачиваются отдельно)
  chat_overage_tokens: number;
  embedding_overage_tokens: number;
  total_overage_tokens: number;
  overage_cost_usd: number; // Стоимость перерасхода
  
  // Cost
  estimated_cost_usd: number;
  
  // Resource limits
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;
  
  // Settings
  hard_limit_enabled: boolean;
  alert_threshold_percent: number;
  overage_allowed: boolean;
  overage_price_per_1k_chat: number | null;    // Цена за 1000 токенов сверх лимита
  overage_price_per_1k_embedding: number | null;
}
```

**Важно про overage:** Если `overage_allowed = true`, пользователь может продолжать использовать сервис после исчерпания лимита, но будет платить за перерасход по цене `overage_price_per_1k_*`. Показывайте это в UI:

### 3.2 История использования

```typescript
interface DailyUsage {
  date: string; // ISO date
  chat_tokens: number;
  embedding_tokens: number;
  total_tokens: number;
  cost_usd: number;
  requests: number;
}

interface UsageHistory {
  days: number;
  data: DailyUsage[];
}
```

### 3.3 Информация о плане

```typescript
interface PlanInfo {
  name: string;
  monthly_chat_limit: number;
  monthly_embedding_limit: number;
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;
  price_usd: number;
  overage_allowed: boolean;
  overage_price_per_1k_chat: number | null;
  overage_price_per_1k_embedding: number | null;
  features: string[];
}
```

### 3.4 Статистика платформы (Admin)

```typescript
interface PlatformUsage {
  total_users_with_budgets: number;
  today: {
    tokens: number;
    cost_usd: number;
    requests: number;
  };
  this_month: {
    tokens: number;
    cost_usd: number;
    requests: number;
  };
  users_by_plan: Record<string, number>;
}
```

### 3.5 Ошибка превышения лимита

```typescript
interface TokenLimitError {
  error: {
    code: "TOKEN_LIMIT_EXCEEDED" | "EMBEDDING_LIMIT_EXCEEDED";
    message: string;
    field?: string;
    details?: {
      current_usage: number;
      limit: number;
      limit_type: string;
    };
  };
}
```

---

## 4. UI Компоненты

### 4.1 UsageProgressBar

Прогресс-бар использования токенов с цветовой индикацией.

```tsx
interface UsageProgressBarProps {
  used: number;
  limit: number;
  bonus?: number;
  label: string;
  showPercent?: boolean;
  colorScheme?: "green" | "yellow" | "red"; // auto по умолчанию
}

// Цветовая схема:
// < 70%: зеленый
// 70-90%: желтый
// > 90%: красный
```

**Визуальный пример:**
```
Chat токены: 65,000 / 100,000 (65%)
[████████████████░░░░░░░░░] 
```

### 4.2 TokenCounter

Счетчик токенов для отображения в header или sidebar.

```tsx
interface TokenCounterProps {
  chatUsed: number;
  chatLimit: number;
  showDetails?: boolean;
  compact?: boolean;
}

// Компактный вариант: "65K / 100K"
// Полный вариант с иконкой и процентом
```

### 4.3 PlanBadge

Бейдж текущего плана пользователя.

```tsx
interface PlanBadgeProps {
  plan: "free" | "starter" | "growth" | "scale" | "enterprise";
  size?: "sm" | "md" | "lg";
}

// Цвета по плану:
// free: серый
// starter: синий
// growth: зеленый
// scale: фиолетовый
// enterprise: золотой
```

### 4.4 LimitAlert

Баннер предупреждения о приближении к лимиту.

```tsx
interface LimitAlertProps {
  usagePercent: number;
  daysRemaining: number;
  onUpgrade?: () => void;
  onDismiss?: () => void;
}

// Показывать при:
// - usagePercent >= 80
// - или если daysRemaining <= 3 и usage > 50%
```

### 4.5 UsageChart

График использования токенов за период.

```tsx
interface UsageChartProps {
  data: DailyUsage[];
  period: "7d" | "30d" | "90d";
  showCost?: boolean;
}

// Рекомендуемая библиотека: recharts или chart.js
```

---

## 5. Страницы

### 5.1 Страница использования для OWNER

**Путь:** `/settings/usage` или `/billing`

**Секции:**

1. **Сводка текущего периода**
   - Текущий план с бейджем
   - Дней до обновления периода
   - Общий прогресс использования

2. **Токены чата**
   - Прогресс-бар
   - Использовано / Лимит
   - Бонусные токены (если есть)
   - Расчетная стоимость

3. **Токены embeddings**
   - Аналогично токенам чата

4. **История использования**
   - График за 30 дней
   - Переключатель периодов (7d/30d/90d)

5. **Детализация по проектам**
   - Таблица: проект, токены, запросы, стоимость

6. **Информация о плане**
   - Текущий план и его возможности
   - Кнопка "Улучшить план" (если есть upgrade path)

### 5.2 Страница управления для SAAS_ADMIN

**Путь:** `/admin/billing`

**Секции:**

1. **Обзор платформы**
   - Карточки: всего пользователей, токенов за сегодня, за месяц
   - Распределение по планам (pie chart)

2. **Список пользователей**
   - Таблица с фильтрацией и сортировкой
   - Колонки: email, план, использовано, лимит, %, действия
   - Пагинация

3. **Управление пользователем** (модальное окно или drawer)
   - Текущий план и использование
   - Изменение лимитов
   - Изменение плана
   - Добавление бонусных токенов
   - Сброс периода

---

## 6. Обработка ошибок

### 6.1 Ошибка TOKEN_LIMIT_EXCEEDED

При получении ошибки с кодом `TOKEN_LIMIT_EXCEEDED`:

1. Показать модальное окно:
   ```
   ┌─────────────────────────────────────────┐
   │  ⚠️ Лимит токенов исчерпан              │
   │                                          │
   │  Вы использовали все доступные токены   │
   │  за этот период.                        │
   │                                          │
   │  Использовано: 100,000 / 100,000        │
   │  До сброса: 15 дней                     │
   │                                          │
   │  [Улучшить план]  [Подождать]           │
   └─────────────────────────────────────────┘
   ```

2. Для чата - показать сообщение в интерфейсе чата вместо ответа бота

### 6.2 Предупреждения при приближении

Показывать toast или баннер при:
- 80% использования: желтый, информационный
- 90% использования: оранжевый, предупреждение
- 95%+ использования: красный, критичный

---

## 7. WebSocket события (опционально)

Для real-time обновления счетчиков можно добавить WebSocket события:

```typescript
interface TokensUsedEvent {
  type: "tokens_used";
  data: {
    chat_tokens_used: number;
    embedding_tokens_used: number;
    total_usage_percent: number;
  };
}

interface LimitAlertEvent {
  type: "limit_alert";
  data: {
    threshold: 80 | 90 | 100;
    current_percent: number;
    limit_type: "chat" | "embedding" | "combined";
  };
}
```

---

## 8. Интеграция в существующие компоненты

### 8.1 Dashboard (Главная страница OWNER)

Добавить виджет использования:
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 💬 Сообщений │ │ 🎯 Токенов   │ │ 📄 Документов│
│ (сегодня)    │ │ (использов.) │ │              │
│    500       │ │ 65K / 100K   │ │    500       │
│ 15K за месяц │ │ [████████░░] │ │ 25K чанков   │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 8.2 Header или Sidebar

Добавить компактный счетчик токенов:
```
🎯 65K / 100K
```

При клике - переход на страницу /settings/usage

### 8.3 История сессий (chat sessions list)

Уже есть колонка "Токены" - убедиться что отображается:
```
│ Сессия         │ Источник │ Сообщ. │ Токены  │ Статус │
│ #1234 (04.01)  │ 🌐 Web   │ 15     │ 4,500   │ Active │
```

---

## 9. API Hooks (React Query примеры)

```typescript
// hooks/useBilling.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useUsageSummary() {
  return useQuery({
    queryKey: ['billing', 'usage', 'summary'],
    queryFn: () => api.get('/billing/usage/summary'),
    staleTime: 30_000, // 30 секунд
  });
}

export function useUsageHistory(days: number = 30) {
  return useQuery({
    queryKey: ['billing', 'usage', 'history', days],
    queryFn: () => api.get(`/billing/usage/history?days=${days}`),
    staleTime: 60_000, // 1 минута
  });
}

export function useLimits() {
  return useQuery({
    queryKey: ['billing', 'limits'],
    queryFn: () => api.get('/billing/limits'),
    staleTime: 5 * 60_000, // 5 минут
  });
}

// Admin hooks
export function usePlatformUsage() {
  return useQuery({
    queryKey: ['admin', 'billing', 'platform'],
    queryFn: () => api.get('/billing/admin/usage/platform'),
  });
}

export function useUpdateUserLimits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateLimitsRequest }) =>
      api.put(`/billing/admin/users/${userId}/limits`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'billing'] });
    },
  });
}
```

---

## 10. Локализация

Ключи для перевода:

```json
{
  "billing.title": "Использование и лимиты",
  "billing.current_plan": "Текущий план",
  "billing.days_remaining": "Дней до сброса: {days}",
  "billing.chat_tokens": "Токены чата",
  "billing.embedding_tokens": "Токены embeddings",
  "billing.used_of": "{used} из {limit}",
  "billing.upgrade_plan": "Улучшить план",
  "billing.limit_exceeded": "Лимит токенов исчерпан",
  "billing.limit_warning_80": "Вы использовали 80% токенов за этот период",
  "billing.limit_warning_90": "Осталось менее 10% токенов!",
  "billing.estimated_cost": "Расчетная стоимость",
  "billing.usage_history": "История использования",
  "billing.by_project": "По проектам",
  "billing.by_avatar": "По аватарам",
  
  "admin.billing.title": "Управление биллингом",
  "admin.billing.platform_stats": "Статистика платформы",
  "admin.billing.users_list": "Пользователи",
  "admin.billing.add_bonus": "Добавить бонусные токены",
  "admin.billing.change_plan": "Изменить план",
  "admin.billing.reset_period": "Сбросить период"
}
```

---

## 11. Приоритеты реализации

### Фаза 1 (MVP)
- [ ] Страница /settings/usage для OWNER
- [ ] Компонент UsageProgressBar
- [ ] Виджет на Dashboard
- [ ] Обработка ошибки TOKEN_LIMIT_EXCEEDED

### Фаза 2
- [ ] История и графики
- [ ] Компонент LimitAlert
- [ ] Интеграция в header/sidebar

### Фаза 3
- [ ] Административная страница /admin/billing
- [ ] Управление пользователями (лимиты, планы, бонусы)

### Фаза 4
- [ ] WebSocket real-time обновления
- [ ] Страница тарифных планов с оплатой

---

## 12. Зависимости

- React Query для запросов
- recharts или chart.js для графиков
- date-fns для форматирования дат
- tailwindcss для стилей (или текущий CSS framework)

---

## 13. Контакты

По вопросам реализации обращаться к Backend Team.

API документация доступна в Swagger: `/docs`

