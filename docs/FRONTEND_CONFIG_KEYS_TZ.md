# ТЗ: Управление API-ключами и секретами платформы

## Обзор

Реализация функционала для безопасного управления API-ключами и секретами:
- **SAAS_ADMIN**: глобальные настройки платформы (OpenAI, LangSmith, SMTP и др.)
- **OWNER**: секреты проекта (Telegram Bot Token, вебхуки)

Все значения хранятся в зашифрованном виде на бекенде. API возвращает только маскированные значения (последние 4 символа).

---

## Содержание

1. [SAAS_ADMIN: Настройки платформы](#1-saas_admin-настройки-платформы)
2. [OWNER: Секреты проекта](#2-owner-секреты-проекта)
3. [API Endpoints](#3-api-endpoints)
4. [Коды ошибок](#4-коды-ошибок)
5. [Компоненты и UI/UX](#5-компоненты-и-uiux)
6. [Рекомендации по реализации](#6-рекомендации-по-реализации)

---

## 1. SAAS_ADMIN: Настройки платформы

### 1.1 Путь в приложении

```
/admin/settings/platform
```

Доступ: только пользователи с ролью `saas_admin`

### 1.2 Доступные типы ключей

| Ключ | Тип | Описание | Валидация |
|------|-----|----------|-----------|
| `openai_api_key` | LLM | Основной ключ OpenAI | Проверка через API |
| `anthropic_api_key` | LLM | Ключ Anthropic (Claude) | Проверка формата |
| `langsmith_api_key` | Monitoring | LangSmith для трасировки | Проверка формата |
| `sentry_dsn` | Monitoring | Sentry DSN | Проверка формата URL |
| `smtp_password` | Email | Пароль SMTP | Непустое значение |

### 1.3 Макет страницы

```
┌─────────────────────────────────────────────────────────────────────┐
│  ⚙️ Настройки платформы                                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🤖 LLM Providers                                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  OpenAI API Key                                              │   │
│  │  ┌─────────────────────────────────────┐  ┌────────────────┐│   │
│  │  │ ••••••••••••••••••••••••••••sk-1234 │  │ 👁️ │ Проверить ││   │
│  │  └─────────────────────────────────────┘  └────────────────┘│   │
│  │  ✅ Установлен • Обновлено: 05.01.2026 15:30                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Anthropic API Key                                           │   │
│  │  ┌─────────────────────────────────────┐  ┌────────────────┐│   │
│  │  │ Не установлен                        │  │   Добавить    ││   │
│  │  └─────────────────────────────────────┘  └────────────────┘│   │
│  │  ⚠️ Не установлен                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  📊 Monitoring                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LangSmith API Key                                           │   │
│  │  ...                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  📧 Email                                                           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  SMTP Password                                               │   │
│  │  ...                                                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.4 Модальное окно редактирования

```
┌─────────────────────────────────────────────────────┐
│  Редактировать OpenAI API Key                    ✕  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  API Key *                                          │
│  ┌─────────────────────────────────────────┐  👁️   │
│  │ sk-proj-...                             │       │
│  └─────────────────────────────────────────┘       │
│  Текущее значение: ••••••••••••sk-1234             │
│                                                     │
│  Название                                           │
│  ┌─────────────────────────────────────────┐       │
│  │ OpenAI API Key                          │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  Описание                                           │
│  ┌─────────────────────────────────────────┐       │
│  │ Основной ключ для LLM запросов          │       │
│  └─────────────────────────────────────────┘       │
│                                                     │
│  ☑️ Активен                                         │
│                                                     │
│  ┌───────────────┐  ┌────────────────────────────┐ │
│  │   Отмена      │  │   💾 Сохранить             │ │
│  └───────────────┘  └────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## 2. OWNER: Секреты проекта

### 2.1 Путь в приложении

```
/projects/{project_id}/settings/integrations
```

или

```
/projects/{project_id}/settings/secrets
```

Доступ: только владелец проекта (`project.owner_id === current_user.id`)

### 2.2 Доступные типы секретов

| Ключ | Тип | Описание | Валидация |
|------|-----|----------|-----------|
| `telegram_bot_token` | Integration | Токен Telegram бота | Проверка через Telegram API |
| `webhook_secret` | Integration | Секрет для вебхуков | Непустое значение |
| `custom_api_key` | Integration | Кастомный API ключ | Непустое значение |

**ВАЖНО**: OWNER НЕ может добавлять OpenAI ключи или другие LLM ключи. Это делает только SAAS_ADMIN централизованно.

### 2.3 Макет страницы

```
┌─────────────────────────────────────────────────────────────────────┐
│  🔐 Секреты проекта: Мой проект                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  🤖 Telegram Integration                                            │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Bot Token                                                   │   │
│  │  ┌─────────────────────────────────────┐  ┌────────────────┐│   │
│  │  │ ••••••••••••••:ABC                  │  │ 👁️ │ Проверить ││   │
│  │  └─────────────────────────────────────┘  └────────────────┘│   │
│  │  ✅ @my_bot • Обновлено: 05.01.2026 15:30                   │   │
│  │                                                              │   │
│  │  ┌───────────────────┐  ┌────────────────────────────────┐  │   │
│  │  │ ✏️ Редактировать  │  │ 🗑️ Удалить                     │  │   │
│  │  └───────────────────┘  └────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  🔗 Webhooks                                                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Webhook Secret                                              │   │
│  │  ┌─────────────────────────────────────┐  ┌────────────────┐│   │
│  │  │ Не установлен                        │  │   Добавить    ││   │
│  │  └─────────────────────────────────────┘  └────────────────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  + Добавить секрет                                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.4 Информационный блок для OWNER

Добавить информационный блок, объясняющий что OpenAI ключи управляются централизованно:

```
┌─────────────────────────────────────────────────────────────────────┐
│  ℹ️ Информация                                                      │
│                                                                     │
│  OpenAI и другие LLM ключи управляются администратором платформы.   │
│  Здесь вы можете настроить только интеграционные секреты вашего     │
│  проекта (Telegram, вебхуки).                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. API Endpoints

### 3.1 SAAS_ADMIN: Platform Config

**Base URL**: `/api/v1/admin/platform/config`

#### Получить список конфигураций

```http
GET /api/v1/admin/platform/config
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid-1",
      "key": "openai_api_key",
      "key_type": "openai_api_key",
      "display_name": "OpenAI API Key",
      "description": "Основной ключ для LLM",
      "masked_value": "••••••••••••sk-1234",
      "is_set": true,
      "is_active": true,
      "created_at": "2026-01-05T12:00:00Z",
      "updated_at": "2026-01-05T15:30:00Z",
      "updated_by": "admin-uuid"
    }
  ],
  "total": 1
}
```

#### Получить конфигурацию по ключу

```http
GET /api/v1/admin/platform/config/{key}
Authorization: Bearer {token}
```

#### Создать/обновить конфигурацию

```http
POST /api/v1/admin/platform/config
Authorization: Bearer {token}
Content-Type: application/json

{
  "key": "openai_api_key",
  "value": "sk-proj-abc123...",
  "key_type": "openai_api_key",
  "display_name": "OpenAI API Key",
  "description": "Основной ключ для LLM запросов",
  "is_active": true
}
```

**Response 201:**
```json
{
  "id": "uuid-1",
  "key": "openai_api_key",
  "key_type": "openai_api_key",
  "display_name": "OpenAI API Key",
  "description": "Основной ключ для LLM запросов",
  "masked_value": "••••••••••••c123",
  "is_set": true,
  "is_active": true,
  "created_at": "2026-01-05T15:30:00Z",
  "updated_at": "2026-01-05T15:30:00Z",
  "updated_by": "admin-uuid"
}
```

#### Обновить конфигурацию

```http
PUT /api/v1/admin/platform/config/{key}
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "sk-proj-new-key...",
  "display_name": "OpenAI API Key (Updated)",
  "is_active": true
}
```

#### Удалить конфигурацию

```http
DELETE /api/v1/admin/platform/config/{key}
Authorization: Bearer {token}
```

**Response 204:** No Content

#### Проверить валидность ключа

```http
POST /api/v1/admin/platform/config/{key}/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "sk-proj-abc123..."
}
```

**Response 200:**
```json
{
  "valid": true,
  "message": "API key is valid"
}
```

**Response 200 (невалидный):**
```json
{
  "valid": false,
  "message": "Invalid API key"
}
```

### 3.2 OWNER: Project Secrets

**Base URL**: `/api/v1/projects/{project_id}/secrets`

#### Получить список секретов проекта

```http
GET /api/v1/projects/{project_id}/secrets
Authorization: Bearer {token}
```

**Response 200:**
```json
{
  "items": [
    {
      "id": "uuid-1",
      "project_id": "project-uuid",
      "key": "telegram_bot_token",
      "key_type": "telegram_bot_token",
      "display_name": "My Telegram Bot",
      "description": "Бот для проекта",
      "masked_value": "••••••••••:ABC",
      "is_set": true,
      "is_active": true,
      "created_at": "2026-01-05T12:00:00Z",
      "updated_at": "2026-01-05T15:30:00Z",
      "updated_by": "owner-uuid"
    }
  ],
  "total": 1
}
```

#### Получить секрет по ключу

```http
GET /api/v1/projects/{project_id}/secrets/{key}
Authorization: Bearer {token}
```

#### Создать секрет

```http
POST /api/v1/projects/{project_id}/secrets
Authorization: Bearer {token}
Content-Type: application/json

{
  "key": "telegram_bot_token",
  "value": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz",
  "key_type": "telegram_bot_token",
  "display_name": "My Telegram Bot",
  "description": "Бот для проекта",
  "is_active": true
}
```

**Response 201:**
```json
{
  "id": "uuid-1",
  "project_id": "project-uuid",
  "key": "telegram_bot_token",
  "key_type": "telegram_bot_token",
  "display_name": "My Telegram Bot",
  "description": "Бот для проекта",
  "masked_value": "••••••••••xyz",
  "is_set": true,
  "is_active": true,
  "created_at": "2026-01-05T15:30:00Z",
  "updated_at": "2026-01-05T15:30:00Z",
  "updated_by": "owner-uuid"
}
```

#### Обновить секрет

```http
PUT /api/v1/projects/{project_id}/secrets/{key}
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "new-token...",
  "display_name": "Updated Bot Name",
  "is_active": true
}
```

#### Удалить секрет

```http
DELETE /api/v1/projects/{project_id}/secrets/{key}
Authorization: Bearer {token}
```

**Response 204:** No Content

#### Проверить Telegram токен

```http
POST /api/v1/projects/{project_id}/secrets/telegram/validate
Authorization: Bearer {token}
Content-Type: application/json

{
  "value": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
}
```

**Response 200:**
```json
{
  "valid": true,
  "bot_username": "my_bot",
  "bot_first_name": "My Bot"
}
```

**Response 200 (невалидный):**
```json
{
  "valid": false,
  "message": "Invalid bot token"
}
```

---

## 4. Коды ошибок

### 4.1 Новые коды CONFIG_*

| Код | HTTP | Описание RU | Действие на фронте |
|-----|------|-------------|-------------------|
| `CONFIG_NOT_FOUND` | 404 | Конфигурация не найдена | Показать уведомление, обновить список |
| `CONFIG_ALREADY_EXISTS` | 409 | Конфигурация уже существует | Показать ошибку у поля key |
| `CONFIG_INVALID_KEY_TYPE` | 400 | Неверный тип ключа | Показать ошибку у select key_type |
| `CONFIG_ENCRYPTION_ERROR` | 500 | Ошибка шифрования | Показать общую ошибку, попросить повторить |
| `CONFIG_KEY_VALIDATION_FAILED` | 400 | Ключ недействителен | Показать ошибку у поля value |
| `CONFIG_ACCESS_DENIED` | 403 | Доступ запрещен | Редирект или показ ошибки доступа |
| `CONFIG_KEY_TYPE_NOT_ALLOWED` | 403 | Тип ключа недоступен | Показать информационное сообщение |

### 4.2 TypeScript переводы

```typescript
// src/lib/errorTranslations.ts

export const configErrorTranslations: Record<string, string> = {
  "CONFIG_NOT_FOUND": "Конфигурация не найдена",
  "CONFIG_ALREADY_EXISTS": "Конфигурация уже существует",
  "CONFIG_INVALID_KEY_TYPE": "Неверный тип ключа",
  "CONFIG_ENCRYPTION_ERROR": "Ошибка шифрования. Попробуйте еще раз.",
  "CONFIG_KEY_VALIDATION_FAILED": "Ключ недействителен. Проверьте правильность.",
  "CONFIG_ACCESS_DENIED": "У вас нет доступа к этой конфигурации",
  "CONFIG_KEY_TYPE_NOT_ALLOWED": "Вы не можете управлять этим типом ключей",
};

export function getConfigErrorMessage(code: string): string {
  return configErrorTranslations[code] || "Произошла ошибка";
}
```

### 4.3 Обработка ошибок

```typescript
// src/lib/api/configApi.ts

import { getConfigErrorMessage } from '../errorTranslations';

export async function createConfig(data: ConfigCreate): Promise<ConfigResponse> {
  const response = await fetch('/api/v1/admin/platform/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorCode = errorData?.error?.code;
    const message = getConfigErrorMessage(errorCode);
    
    throw new ApiError(errorCode, message, errorData?.error?.field);
  }

  return response.json();
}
```

---

## 5. Компоненты и UI/UX

### 5.1 SecretInput - компонент для ввода секретов

```typescript
// src/components/SecretInput.tsx

interface SecretInputProps {
  value: string;
  onChange: (value: string) => void;
  maskedValue?: string;  // "••••••••sk-1234"
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onValidate?: () => void;
  isValidating?: boolean;
}

/**
 * Компонент для ввода секретных значений
 * 
 * Особенности:
 * - Показывает маскированное значение если не в режиме редактирования
 * - Toggle для показа/скрытия введенного значения
 * - Кнопка валидации (опционально)
 * - Индикатор загрузки при валидации
 */
```

**UI состояния:**

1. **Пустое поле** (не установлено):
   - Placeholder: "Введите API ключ..."
   - Кнопка "Добавить"

2. **Установлено, режим просмотра**:
   - Показывает: `••••••••••••sk-1234`
   - Кнопки: "Редактировать", "Удалить"

3. **Режим редактирования**:
   - Input type="password" / type="text" (toggle)
   - Показывает текущее значение внизу: "Текущее: ••••sk-1234"
   - Кнопки: "Отмена", "Сохранить"

4. **Валидация**:
   - Спиннер на кнопке
   - После валидации: ✅ или ❌ с сообщением

### 5.2 ConfigCard - карточка конфигурации

```typescript
// src/components/ConfigCard.tsx

interface ConfigCardProps {
  config: {
    key: string;
    key_type: string;
    display_name: string;
    description?: string;
    masked_value: string;
    is_set: boolean;
    is_active: boolean;
    updated_at: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onValidate?: () => void;
}

/**
 * Карточка для отображения конфигурации/секрета
 * 
 * Содержит:
 * - Название и описание
 * - Маскированное значение
 * - Статус (установлен/не установлен, активен/неактивен)
 * - Дата последнего обновления
 * - Кнопки действий
 */
```

### 5.3 ConfigModal - модальное окно редактирования

```typescript
// src/components/ConfigModal.tsx

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: ConfigResponse;  // null для создания нового
  keyType: string;
  onSave: (data: ConfigCreate | ConfigUpdate) => Promise<void>;
  onValidate?: (value: string) => Promise<ValidationResult>;
}

/**
 * Модальное окно для создания/редактирования конфигурации
 * 
 * Поля:
 * - key (только при создании, readonly при редактировании)
 * - value (SecretInput)
 * - display_name
 * - description (textarea)
 * - is_active (checkbox)
 * 
 * Кнопки:
 * - Отмена
 * - Проверить ключ (опционально)
 * - Сохранить
 */
```

### 5.4 Статусы и индикаторы

| Статус | Иконка | Цвет | Текст |
|--------|--------|------|-------|
| Установлен и активен | ✅ | green | "Активен" |
| Установлен, не активен | ⏸️ | yellow | "Отключен" |
| Не установлен | ⚠️ | gray | "Не установлен" |
| Ошибка валидации | ❌ | red | "Недействителен" |

---

## 6. Рекомендации по реализации

### 6.1 Архитектура

```
src/
├── components/
│   ├── secrets/
│   │   ├── SecretInput.tsx
│   │   ├── ConfigCard.tsx
│   │   ├── ConfigModal.tsx
│   │   ├── ConfigList.tsx
│   │   └── ValidationStatus.tsx
│   └── ...
├── pages/
│   ├── admin/
│   │   └── settings/
│   │       └── platform.tsx        # SAAS_ADMIN page
│   └── projects/
│       └── [projectId]/
│           └── settings/
│               └── secrets.tsx     # OWNER page
├── lib/
│   ├── api/
│   │   ├── platformConfig.ts       # API для SAAS_ADMIN
│   │   └── projectSecrets.ts       # API для OWNER
│   └── hooks/
│       ├── usePlatformConfig.ts
│       └── useProjectSecrets.ts
└── ...
```

### 6.2 State Management

**React Query рекомендуется** для управления данными:

```typescript
// src/lib/hooks/usePlatformConfig.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/platformConfig';

export function usePlatformConfigs() {
  return useQuery({
    queryKey: ['platform-configs'],
    queryFn: api.listConfigs,
  });
}

export function useCreateConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-configs'] });
    },
  });
}

export function useValidateKey(keyType: string) {
  return useMutation({
    mutationFn: (value: string) => api.validateKey(keyType, value),
  });
}
```

### 6.3 Безопасность на фронтенде

1. **Никогда не логировать значения ключей**
   ```typescript
   // ❌ Неправильно
   console.log('Saving key:', data.value);
   
   // ✅ Правильно
   console.log('Saving key:', data.key);
   ```

2. **Очищать значения при unmount**
   ```typescript
   useEffect(() => {
     return () => {
       setSecretValue('');
     };
   }, []);
   ```

3. **Не хранить значения в localStorage/sessionStorage**
   ```typescript
   // ❌ Неправильно
   localStorage.setItem('api_key', value);
   
   // ✅ Только в state компонента
   const [value, setValue] = useState('');
   ```

4. **Использовать autocomplete="off"**
   ```html
   <input type="password" autocomplete="off" />
   ```

### 6.4 Валидация перед сохранением

```typescript
// src/components/ConfigModal.tsx

const handleSave = async () => {
  // 1. Базовая валидация
  if (!value.trim()) {
    setError('Значение не может быть пустым');
    return;
  }

  // 2. Опциональная проверка ключа
  if (shouldValidate && onValidate) {
    setIsValidating(true);
    const result = await onValidate(value);
    setIsValidating(false);
    
    if (!result.valid) {
      setError(result.message || 'Ключ недействителен');
      return;
    }
  }

  // 3. Сохранение
  try {
    await onSave({ ...formData, value });
    onClose();
  } catch (error) {
    setError(getConfigErrorMessage(error.code));
  }
};
```

### 6.5 Группировка ключей по категориям

```typescript
// src/lib/configCategories.ts

export const PLATFORM_CONFIG_CATEGORIES = [
  {
    id: 'llm',
    name: 'LLM Providers',
    icon: '🤖',
    keys: ['openai_api_key', 'anthropic_api_key'],
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: '📊',
    keys: ['langsmith_api_key', 'sentry_dsn'],
  },
  {
    id: 'email',
    name: 'Email',
    icon: '📧',
    keys: ['smtp_password'],
  },
];

export const PROJECT_SECRET_CATEGORIES = [
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '📱',
    keys: ['telegram_bot_token'],
  },
  {
    id: 'webhooks',
    name: 'Webhooks',
    icon: '🔗',
    keys: ['webhook_secret'],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '🔑',
    keys: ['custom_api_key'],
  },
];
```

### 6.6 Доступ к страницам

```typescript
// src/middleware/roleGuard.ts

export function withSaasAdminGuard(Component: React.FC) {
  return function GuardedComponent(props: any) {
    const { user } = useAuth();
    
    if (user?.role !== 'saas_admin') {
      return <Navigate to="/403" />;
    }
    
    return <Component {...props} />;
  };
}

export function withProjectOwnerGuard(Component: React.FC) {
  return function GuardedComponent(props: any) {
    const { projectId } = useParams();
    const { user } = useAuth();
    const { data: project } = useProject(projectId);
    
    if (project && project.owner_id !== user?.id) {
      return <AccessDenied message="Только владелец проекта может управлять секретами" />;
    }
    
    return <Component {...props} />;
  };
}
```

### 6.7 Тесты

```typescript
// src/components/secrets/__tests__/SecretInput.test.tsx

describe('SecretInput', () => {
  it('shows masked value when not editing', () => {
    render(<SecretInput maskedValue="••••sk-1234" value="" onChange={() => {}} />);
    expect(screen.getByText('••••sk-1234')).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    render(<SecretInput value="secret123" onChange={() => {}} />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'password');
    
    await userEvent.click(screen.getByLabelText('Show password'));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('calls onValidate when validate button clicked', async () => {
    const onValidate = jest.fn();
    render(<SecretInput value="test" onChange={() => {}} onValidate={onValidate} />);
    
    await userEvent.click(screen.getByText('Проверить'));
    expect(onValidate).toHaveBeenCalled();
  });
});
```

---

## 7. Чеклист для реализации

### SAAS_ADMIN

- [ ] Страница `/admin/settings/platform`
- [ ] Получение списка конфигураций (GET)
- [ ] Создание конфигурации (POST)
- [ ] Редактирование конфигурации (PUT)
- [ ] Удаление конфигурации (DELETE)
- [ ] Валидация OpenAI ключа (POST /validate)
- [ ] Группировка по категориям
- [ ] Индикаторы статуса (установлен/активен)
- [ ] Обработка ошибок CONFIG_*
- [ ] Защита роутов (только saas_admin)

### OWNER

- [ ] Страница `/projects/{id}/settings/secrets`
- [ ] Получение списка секретов проекта (GET)
- [ ] Создание секрета (POST)
- [ ] Редактирование секрета (PUT)
- [ ] Удаление секрета (DELETE)
- [ ] Валидация Telegram токена (POST /telegram/validate)
- [ ] Информационный блок про LLM ключи
- [ ] Показ bot_username после валидации
- [ ] Обработка ошибок CONFIG_*
- [ ] Защита роутов (только owner проекта)

### Общее

- [ ] Компонент SecretInput
- [ ] Компонент ConfigCard
- [ ] Компонент ConfigModal
- [ ] Переводы ошибок CONFIG_*
- [ ] Unit тесты для компонентов
- [ ] E2E тесты для основных сценариев

---

## 8. Примеры сценариев

### Сценарий 1: SAAS_ADMIN добавляет OpenAI ключ

1. Админ заходит в `/admin/settings/platform`
2. Нажимает "Добавить" на карточке OpenAI
3. Вводит ключ `sk-proj-abc123...`
4. Нажимает "Проверить" - видит ✅ "Ключ валиден"
5. Нажимает "Сохранить"
6. Карточка обновляется: `••••••••••••c123` + статус "Активен"

### Сценарий 2: OWNER добавляет Telegram бота

1. Владелец заходит в `/projects/my-project/settings/secrets`
2. Нажимает "Добавить секрет"
3. Выбирает тип "Telegram Bot Token"
4. Вводит токен от @BotFather
5. Нажимает "Проверить" - видит "✅ @my_bot (My Bot)"
6. Нажимает "Сохранить"
7. Карточка показывает: `••••••••:xyz` + "@my_bot"

### Сценарий 3: OWNER пытается добавить OpenAI ключ

1. Владелец заходит в `/projects/my-project/settings/secrets`
2. В списке типов нет "OpenAI API Key" (скрыт на бекенде)
3. Если попытается отправить запрос напрямую - получит `CONFIG_KEY_TYPE_NOT_ALLOWED`
4. Показывается: "Вы не можете управлять этим типом ключей"

### Сценарий 4: Ошибка доступа

1. Пользователь B пытается открыть секреты проекта пользователя A
2. Backend возвращает `CONFIG_ACCESS_DENIED`
3. Показывается страница "Доступ запрещен"
4. Кнопка "Вернуться к моим проектам"

---

## Контакты

При возникновении вопросов по API или интеграции обращайтесь к backend-разработчику.

**Swagger документация**: `http://localhost:8000/docs`

**Эндпоинты для тестирования**:
- Platform Config: `/api/v1/admin/platform/config`
- Project Secrets: `/api/v1/projects/{project_id}/secrets`

