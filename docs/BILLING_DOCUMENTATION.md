# Документация по системе биллинга

## Оглавление

1. [Обзор системы](#1-обзор-системы)
2. [Планы подписки](#2-планы-подписки)
3. [Модели данных](#3-модели-данных)
4. [API Endpoints](#4-api-endpoints)
5. [Пользовательские API](#5-пользовательские-api)
6. [Админские API](#6-админские-api)
7. [Механизм работы](#7-механизм-работы)
8. [Интеграция с Frontend](#8-интеграция-с-frontend)
9. [Ограничения и рекомендации](#9-ограничения-и-рекомендации)

---

## 1. Обзор системы

Система биллинга реализует модель подписки с ограничением по токенам и ресурсам.

### Архитектура

```
┌─────────────────────────────────────────────────────────────────┐
│                      BILLING SYSTEM                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     │
│  │    Users     │────▶│ TokenBudget  │────▶│  UsageLog    │     │
│  │  (OWNER)     │     │  (per user)  │     │ (per request)│     │
│  └──────────────┘     └──────────────┘     └──────────────┘     │
│         │                    │                     │             │
│         │                    ▼                     │             │
│         │            ┌──────────────┐              │             │
│         │            │ UsageHistory │◀─────────────┘             │
│         │            │  (archived)  │                            │
│         ▼            └──────────────┘                            │
│  ┌──────────────┐                                                │
│  │   Projects   │ ─── max_projects limit                        │
│  └──────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                                │
│  │   Avatars    │ ─── max_avatars_per_project limit             │
│  └──────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                                │
│  │  Documents   │ ─── max_documents_per_avatar limit            │
│  └──────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Ключевые компоненты

| Компонент | Описание |
|-----------|----------|
| **TokenBudget** | Бюджет токенов пользователя (лимиты, использование, план) |
| **TokenUsageLog** | Детальный лог каждого использования токенов |
| **UsageHistory** | Архив использования за прошлые периоды |
| **SubscriptionPlan** | Тип подписки (FREE, STARTER, GROWTH, SCALE, ENTERPRISE) |

---

## 2. Планы подписки

### Сравнение планов

| План | Chat токенов/мес | Embedding/мес | Проекты | Аватары/проект | Документы/аватар | Цена |
|------|------------------|---------------|---------|----------------|------------------|------|
| **FREE** | 10,000 | 5,000 | 1 | 1 | 10 | $0 |
| **STARTER** | 100,000 | 50,000 | 3 | 5 | 50 | $29 |
| **GROWTH** | 500,000 | 200,000 | 10 | 20 | 200 | $99 |
| **SCALE** | 2,000,000 | 1,000,000 | 50 | 100 | 1,000 | $299 |
| **ENTERPRISE** | 10,000,000 | 5,000,000 | 1000 | 1000 | 10,000 | Custom |

### Фичи по планам

| План | Включённые функции |
|------|-------------------|
| **FREE** | basic_chat, basic_analytics, community_support |
| **STARTER** | all_chat_models, full_analytics, telegram_integration, email_support |
| **GROWTH** | + priority_support, api_access, custom_branding, advanced_analytics |
| **SCALE** | + dedicated_support, sla_guarantee, white_label, webhooks |
| **ENTERPRISE** | + custom_integrations, on_premise_option, dedicated_infrastructure, custom_models |

### Overage (превышение лимитов)

| План | Overage разрешён | Chat $/1K токенов | Embedding $/1K токенов |
|------|------------------|-------------------|------------------------|
| FREE | ❌ Нет | - | - |
| STARTER | ✅ Да | $0.030 | $0.003 |
| GROWTH | ✅ Да | $0.025 | $0.0025 |
| SCALE | ✅ Да | $0.020 | $0.002 |
| ENTERPRISE | ✅ Да | $0.015 | $0.0015 |

### Ценообразование моделей (за 1M токенов)

| Модель | Input | Output |
|--------|-------|--------|
| gpt-4-turbo-preview | $10.00 | $30.00 |
| gpt-4-turbo | $10.00 | $30.00 |
| gpt-4o | $5.00 | $15.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-3.5-turbo | $0.50 | $1.50 |
| text-embedding-3-small | $0.02 | - |
| text-embedding-3-large | $0.13 | - |

---

## 3. Модели данных

### TokenBudget

Основная сущность для хранения бюджета пользователя.

```python
class TokenBudget:
    user_id: str                    # ID владельца (OWNER)
    plan: SubscriptionPlan          # Текущий план подписки
    
    # Chat токены
    monthly_chat_limit: int         # Месячный лимит chat токенов
    chat_tokens_used: int           # Использовано chat токенов
    bonus_chat_tokens: int          # Бонусные chat токены
    
    # Embedding токены
    monthly_embedding_limit: int    # Месячный лимит embedding токенов
    embedding_tokens_used: int      # Использовано embedding токенов
    bonus_embedding_tokens: int     # Бонусные embedding токены
    
    # Лимиты ресурсов
    max_projects: int               # Макс. проектов
    max_avatars_per_project: int    # Макс. аватаров на проект
    max_documents_per_avatar: int   # Макс. документов на аватар
    
    # Биллинговый период
    period_start: date              # Начало периода
    period_end: date                # Конец периода
    
    # Настройки
    hard_limit_enabled: bool        # Жёсткое ограничение (блокировать при превышении)
    alert_threshold_percent: int    # Порог оповещения (%)
    auto_topup_enabled: bool        # Автопополнение
    
    # Overage (превышение)
    chat_overage_tokens: int        # Chat токены сверх лимита
    embedding_overage_tokens: int   # Embedding токены сверх лимита
    overage_cost_usd: Decimal       # Стоимость overage
    
    # Оповещения
    alert_sent_at_80: bool          # Отправлено оповещение на 80%
    alert_sent_at_90: bool          # Отправлено оповещение на 90%
    alert_sent_at_100: bool         # Отправлено оповещение на 100%
```

### TokenUsageLog

Детальный лог использования токенов.

```python
class TokenUsageLog:
    user_id: str                    # ID владельца
    project_id: str | None          # ID проекта
    avatar_id: str | None           # ID аватара
    session_id: str | None          # ID сессии чата
    message_id: str | None          # ID сообщения
    client_id: str | None           # ID клиента (end-user)
    
    operation_type: OperationType   # chat | embedding | rerank
    
    input_tokens: int               # Входные токены
    output_tokens: int              # Выходные токены
    total_tokens: int               # Всего токенов
    
    model_used: str                 # Используемая модель
    cost_usd: Decimal               # Стоимость в USD
    source: str                     # Источник (web, telegram, api)
    latency_ms: int | None          # Время выполнения
```

---

## 4. API Endpoints

### Обзор всех эндпоинтов

| # | Метод | Endpoint | Роль | Описание |
|---|-------|----------|------|----------|
| 1 | GET | `/api/v1/billing/usage/summary` | User | Сводка использования |
| 2 | GET | `/api/v1/billing/usage/history` | User | История по дням |
| 3 | GET | `/api/v1/billing/usage/breakdown` | User | Разбивка по сущностям |
| 4 | GET | `/api/v1/billing/limits` | User | Текущие лимиты |
| 5 | GET | `/api/v1/billing/plan` | User | Информация о плане |
| 6 | GET | `/api/v1/billing/usage/platform` | Admin | Статистика платформы |
| 7 | GET | `/api/v1/billing/usage/users` | Admin | Список пользователей |
| 8 | GET | `/api/v1/billing/users/{id}/usage` | Admin | Usage пользователя |
| 9 | GET | `/api/v1/billing/users/{id}/budget` | Admin | Бюджет пользователя |
| 10 | PUT | `/api/v1/billing/users/{id}/limits` | Admin | Изменить лимиты |
| 11 | PUT | `/api/v1/billing/users/{id}/plan` | Admin | Изменить план |
| 12 | POST | `/api/v1/billing/users/{id}/bonus-tokens` | Admin | Добавить бонус |
| 13 | POST | `/api/v1/billing/users/{id}/reset-period` | Admin | Сбросить период |

---

## 5. Пользовательские API

### 5.1 GET `/api/v1/billing/usage/summary`

Получить сводку использования за текущий биллинговый период.

**Заголовки:**
```
Authorization: Bearer {access_token}
```

**Ответ (200 OK):**
```json
{
  "plan": "starter",
  "plan_features": ["all_chat_models", "full_analytics", "telegram_integration", "email_support"],
  "period_start": "2026-01-01",
  "period_end": "2026-01-31",
  "days_remaining": 22,
  
  "chat_tokens_limit": 100000,
  "chat_tokens_used": 25000,
  "chat_tokens_remaining": 75000,
  "chat_bonus_tokens": 10000,
  "chat_usage_percent": 22.73,
  
  "embedding_tokens_limit": 50000,
  "embedding_tokens_used": 5000,
  "embedding_tokens_remaining": 45000,
  "embedding_bonus_tokens": 0,
  "embedding_usage_percent": 10.0,
  
  "total_tokens_used": 30000,
  "total_usage_percent": 18.75,
  
  "chat_overage_tokens": 0,
  "embedding_overage_tokens": 0,
  "total_overage_tokens": 0,
  "overage_cost_usd": 0.0,
  
  "estimated_cost_usd": 0.45,
  
  "max_projects": 3,
  "max_avatars_per_project": 5,
  "max_documents_per_avatar": 50,
  
  "hard_limit_enabled": true,
  "alert_threshold_percent": 80,
  "overage_allowed": true,
  "overage_price_per_1k_chat": 0.03,
  "overage_price_per_1k_embedding": 0.003
}
```

---

### 5.2 GET `/api/v1/billing/usage/history`

История использования по дням.

**Query параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| days | int | 30 | Количество дней |

**Ответ:**
```json
{
  "days": 30,
  "data": [
    {
      "date": "2026-01-09",
      "chat_tokens": 5000,
      "embedding_tokens": 1000,
      "total_tokens": 6000,
      "cost_usd": 0.15,
      "requests": 50
    },
    {
      "date": "2026-01-08",
      "chat_tokens": 3000,
      "embedding_tokens": 500,
      "total_tokens": 3500,
      "cost_usd": 0.08,
      "requests": 30
    }
  ]
}
```

---

### 5.3 GET `/api/v1/billing/usage/breakdown`

Разбивка использования по проектам, аватарам, операциям и моделям.

**Ответ:**
```json
{
  "period_start": "2026-01-01",
  "period_end": "2026-01-31",
  "by_project": [
    {
      "project_id": "uuid-1",
      "tokens": 15000,
      "cost_usd": 0.25,
      "requests": 100
    }
  ],
  "by_avatar": [
    {
      "avatar_id": "uuid-2",
      "project_id": "uuid-1",
      "tokens": 10000,
      "cost_usd": 0.18,
      "requests": 75
    }
  ],
  "by_operation": [
    {
      "operation_type": "chat",
      "tokens": 20000,
      "cost_usd": 0.40,
      "requests": 150
    },
    {
      "operation_type": "embedding",
      "tokens": 5000,
      "cost_usd": 0.01,
      "requests": 20
    }
  ],
  "by_model": [
    {
      "model": "gpt-4o-mini",
      "tokens": 18000,
      "cost_usd": 0.35,
      "requests": 140
    }
  ]
}
```

---

### 5.4 GET `/api/v1/billing/limits`

Текущие лимиты пользователя.

**Ответ:**
```json
{
  "plan": "starter",
  "monthly_chat_limit": 100000,
  "monthly_embedding_limit": 50000,
  "max_projects": 3,
  "max_avatars_per_project": 5,
  "max_documents_per_avatar": 50,
  "hard_limit_enabled": true,
  "alert_threshold_percent": 80,
  "overage_allowed": true,
  "overage_price_per_1k_chat": 0.03,
  "overage_price_per_1k_embedding": 0.003
}
```

---

### 5.5 GET `/api/v1/billing/plan`

Информация о текущем плане подписки.

**Ответ:**
```json
{
  "name": "starter",
  "monthly_chat_limit": 100000,
  "monthly_embedding_limit": 50000,
  "max_projects": 3,
  "max_avatars_per_project": 5,
  "max_documents_per_avatar": 50,
  "price_usd": 29.0,
  "overage_allowed": true,
  "overage_price_per_1k_chat": 0.03,
  "overage_price_per_1k_embedding": 0.003,
  "features": [
    "all_chat_models",
    "full_analytics",
    "telegram_integration",
    "email_support"
  ]
}
```

---

## 6. Админские API

Требуют роль `saas_admin`.

### 6.1 GET `/api/v1/billing/usage/platform`

Статистика по всей платформе.

**Ответ:**
```json
{
  "total_users_with_budgets": 534,
  "today": {
    "tokens": 150000,
    "cost_usd": 3.50,
    "requests": 1200
  },
  "this_month": {
    "tokens": 2500000,
    "cost_usd": 75.00,
    "requests": 25000
  },
  "users_by_plan": {
    "free": 400,
    "starter": 100,
    "growth": 25,
    "scale": 8,
    "enterprise": 1
  }
}
```

---

### 6.2 GET `/api/v1/billing/usage/users`

Список пользователей с их использованием.

**Query параметры:**
| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| skip | int | 0 | Пропустить записей |
| limit | int | 50 | Записей на странице |
| plan | string | - | Фильтр по плану |

**Ответ:**
```json
{
  "total": 534,
  "skip": 0,
  "limit": 50,
  "users": [
    {
      "user_id": "uuid-1",
      "plan": "starter",
      "chat_tokens_used": 25000,
      "chat_tokens_limit": 100000,
      "embedding_tokens_used": 5000,
      "embedding_tokens_limit": 50000,
      "total_tokens_used": 30000,
      "usage_percent": 20.0,
      "cost_usd": 0.45,
      "period_start": "2026-01-01",
      "period_end": "2026-01-31"
    }
  ]
}
```

---

### 6.3 GET `/api/v1/billing/users/{user_id}/budget`

Полная информация о бюджете пользователя.

**Ответ:**
```json
{
  "user_id": "uuid-1",
  "plan": "starter",
  "period_start": "2026-01-01",
  "period_end": "2026-01-31",
  
  "monthly_chat_limit": 100000,
  "chat_tokens_used": 25000,
  "bonus_chat_tokens": 10000,
  
  "monthly_embedding_limit": 50000,
  "embedding_tokens_used": 5000,
  "bonus_embedding_tokens": 0,
  
  "max_projects": 3,
  "max_avatars_per_project": 5,
  "max_documents_per_avatar": 50,
  
  "hard_limit_enabled": true,
  "alert_threshold_percent": 80,
  "auto_topup_enabled": false,
  
  "chat_usage_percent": 22.73,
  "embedding_usage_percent": 10.0,
  "total_usage_percent": 18.75
}
```

---

### 6.4 PUT `/api/v1/billing/users/{user_id}/plan`

Изменить план подписки пользователя.

**Тело запроса:**
```json
{
  "plan": "growth"
}
```

**Допустимые значения:** `free`, `starter`, `growth`, `scale`, `enterprise`

**Ответ:** Полная информация о бюджете (TokenBudgetResponse)

---

### 6.5 PUT `/api/v1/billing/users/{user_id}/limits`

Изменить лимиты пользователя (кастомизация).

**Тело запроса:**
```json
{
  "monthly_chat_limit": 200000,
  "monthly_embedding_limit": 100000,
  "max_projects": 5,
  "max_avatars_per_project": 10,
  "max_documents_per_avatar": 100,
  "hard_limit_enabled": false,
  "alert_threshold_percent": 90
}
```

Все поля опциональны — передавайте только те, которые хотите изменить.

---

### 6.6 POST `/api/v1/billing/users/{user_id}/bonus-tokens`

Добавить бонусные токены пользователю.

**Тело запроса:**
```json
{
  "chat_tokens": 50000,
  "embedding_tokens": 10000,
  "reason": "Compensation for downtime"
}
```

---

### 6.7 POST `/api/v1/billing/users/{user_id}/reset-period`

Сбросить текущий биллинговый период (обнулить использование).

**Ответ:** 204 No Content

---

## 7. Механизм работы

### Жизненный цикл биллинга

```
┌────────────────────────────────────────────────────────────────┐
│                     BILLING LIFECYCLE                           │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Регистрация пользователя                                    │
│     └── Создаётся TokenBudget с планом FREE                     │
│                                                                 │
│  2. Использование API (chat/embedding)                          │
│     ├── Проверка: can_use_chat_tokens(amount)?                  │
│     │   ├── Да → Выполнить операцию                             │
│     │   │        ├── Увеличить chat_tokens_used                 │
│     │   │        └── Записать TokenUsageLog                     │
│     │   └── Нет → Проверить overage_allowed                     │
│     │            ├── Да → Выполнить с overage                   │
│     │            │        ├── Увеличить chat_overage_tokens     │
│     │            │        └── Начислить overage_cost_usd        │
│     │            └── Нет → 429 Rate Limit Exceeded              │
│     │                                                           │
│     └── Проверка порогов оповещений (80%, 90%, 100%)            │
│         └── Отправить email если порог достигнут                │
│                                                                 │
│  3. Конец биллингового периода                                  │
│     ├── Создать UsageHistory (архив)                            │
│     ├── Сбросить chat_tokens_used, embedding_tokens_used        │
│     ├── Сбросить overage счётчики                               │
│     ├── Сбросить флаги оповещений                               │
│     └── Установить новый period_start/period_end                │
│                                                                 │
│  4. Апгрейд плана (Admin)                                       │
│     ├── Обновить plan                                           │
│     ├── Обновить лимиты из PLAN_CONFIGS                         │
│     └── Бонусные токены сохраняются                             │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Проверка лимитов при создании ресурсов

При создании проекта:
```python
if user_projects_count >= token_budget.max_projects:
    raise ProjectLimitExceeded()
```

При создании аватара:
```python
if project_avatars_count >= token_budget.max_avatars_per_project:
    raise AvatarLimitExceeded()
```

При загрузке документа:
```python
if avatar_documents_count >= token_budget.max_documents_per_avatar:
    raise DocumentLimitExceeded()
```

---

## 8. Интеграция с Frontend

### Сценарии использования

#### 8.1 Показать usage на дашборде

```typescript
const useSummary = () => {
  const { data } = useQuery(['billing-summary'], () => 
    api.get('/api/v1/billing/usage/summary')
  );
  
  return {
    chatPercent: data?.chat_usage_percent,
    embeddingPercent: data?.embedding_usage_percent,
    daysRemaining: data?.days_remaining,
    plan: data?.plan,
  };
};
```

#### 8.2 Проверить достижение лимита

```typescript
const checkLimits = async () => {
  const { data } = await api.get('/api/v1/billing/usage/summary');
  
  if (data.chat_usage_percent >= 100 && data.hard_limit_enabled) {
    showUpgradeModal();
    return false;
  }
  
  if (data.chat_usage_percent >= 80) {
    showWarningBanner(`Использовано ${data.chat_usage_percent}% токенов`);
  }
  
  return true;
};
```

#### 8.3 Показать график использования

```typescript
const useUsageHistory = (days = 30) => {
  const { data } = useQuery(['usage-history', days], () =>
    api.get(`/api/v1/billing/usage/history?days=${days}`)
  );
  
  return data?.data.map(d => ({
    date: d.date,
    tokens: d.total_tokens,
    cost: d.cost_usd,
  }));
};
```

### TypeScript типы

```typescript
// types/billing.ts

type SubscriptionPlan = 'free' | 'starter' | 'growth' | 'scale' | 'enterprise';

interface UsageSummary {
  plan: SubscriptionPlan;
  plan_features: string[];
  period_start: string;
  period_end: string;
  days_remaining: number;
  
  chat_tokens_limit: number;
  chat_tokens_used: number;
  chat_tokens_remaining: number;
  chat_bonus_tokens: number;
  chat_usage_percent: number;
  
  embedding_tokens_limit: number;
  embedding_tokens_used: number;
  embedding_tokens_remaining: number;
  embedding_bonus_tokens: number;
  embedding_usage_percent: number;
  
  total_tokens_used: number;
  total_usage_percent: number;
  
  chat_overage_tokens: number;
  embedding_overage_tokens: number;
  overage_cost_usd: number;
  
  estimated_cost_usd: number;
  
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;
  
  hard_limit_enabled: boolean;
  alert_threshold_percent: number;
  overage_allowed: boolean;
}

interface PlanInfo {
  name: SubscriptionPlan;
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

interface DailyUsage {
  date: string;
  chat_tokens: number;
  embedding_tokens: number;
  total_tokens: number;
  cost_usd: number;
  requests: number;
}

interface TokenBudget {
  user_id: string;
  plan: SubscriptionPlan;
  period_start: string;
  period_end: string;
  
  monthly_chat_limit: number;
  chat_tokens_used: number;
  bonus_chat_tokens: number;
  
  monthly_embedding_limit: number;
  embedding_tokens_used: number;
  bonus_embedding_tokens: number;
  
  max_projects: number;
  max_avatars_per_project: number;
  max_documents_per_avatar: number;
  
  hard_limit_enabled: boolean;
  alert_threshold_percent: number;
  auto_topup_enabled: boolean;
  
  chat_usage_percent: number;
  embedding_usage_percent: number;
  total_usage_percent: number;
}

// Request types
interface ChangePlanRequest {
  plan: SubscriptionPlan;
}

interface UpdateLimitsRequest {
  monthly_chat_limit?: number;
  monthly_embedding_limit?: number;
  max_projects?: number;
  max_avatars_per_project?: number;
  max_documents_per_avatar?: number;
  hard_limit_enabled?: boolean;
  alert_threshold_percent?: number;
}

interface AddBonusTokensRequest {
  chat_tokens: number;
  embedding_tokens: number;
  reason?: string;
}
```

---

## 9. Ограничения и рекомендации

### Текущие ограничения

| # | Ограничение | Описание |
|---|-------------|----------|
| 1 | Нет публичного списка планов | Пользователь не может через API посмотреть все доступные планы |
| 2 | Нет самостоятельной покупки плана | Только админ может менять план пользователя |
| 3 | Нет интеграции с платёжными системами | Stripe, PayPal не подключены |
| 4 | Нет эндпоинта отмены плана | Только через админа или автоматически |

### Рекомендации по доработке

#### 1. Добавить публичный эндпоинт списка планов

```
GET /api/v1/billing/plans
```

Для страницы Pricing на фронтенде.

#### 2. Добавить self-service подписку

```
POST /api/v1/billing/subscribe
{
  "plan": "growth",
  "payment_method_id": "pm_xxxx"
}
```

#### 3. Добавить отмену подписки

```
POST /api/v1/billing/cancel
{
  "effective_date": "end_of_period"
}
```

#### 4. Интеграция со Stripe

- Stripe Checkout для оплаты
- Stripe Billing для управления подписками
- Webhooks для автоматического обновления статуса

---

## Файлы реализации

| Файл | Описание |
|------|----------|
| `backend/app/modules/billing/domain/models.py` | SQLAlchemy модели |
| `backend/app/modules/billing/config.py` | Конфигурация планов и цен |
| `backend/app/modules/billing/service.py` | Бизнес-логика |
| `backend/app/modules/billing/api/v1/routes/usage.py` | User API routes |
| `backend/app/modules/billing/api/v1/routes/admin.py` | Admin API routes |
| `backend/app/modules/billing/api/v1/schemas/` | Pydantic schemas |
| `backend/app/modules/billing/handlers.py` | Event handlers |
| `backend/app/modules/billing/tasks.py` | Background tasks |

