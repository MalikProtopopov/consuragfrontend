# 📱 Руководство по интеграции Telegram Webhook для фронтенда

Это руководство описывает, как реализовать функционал установки webhook для Telegram-интеграции на фронтенде.

---

## 📋 Обзор API

### Новые endpoint'ы

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/v1/telegram/{project_id}/webhook-url` | Получить готовый URL для webhook |
| POST | `/api/v1/telegram/{project_id}/webhook` | Установить webhook |
| DELETE | `/api/v1/telegram/{project_id}/webhook` | Удалить webhook |

---

## 🔧 Настройка переменных окружения (бэкенд)

Для работы webhook нужна переменная окружения `PUBLIC_API_URL`:

```env
# .env файл на бэкенде
PUBLIC_API_URL=https://your-domain.com

# Для локальной разработки с ngrok:
PUBLIC_API_URL=https://abc123.ngrok-free.app
```

**Важно:** URL должен быть HTTPS и доступен из интернета (для Telegram).

---

## 📡 API Reference

### 1. Получение URL для webhook

**Endpoint:** `GET /api/v1/telegram/{project_id}/webhook-url`

**Заголовки:**
```
Authorization: Bearer <access_token>
```

**Успешный ответ (200):**
```json
{
  "webhook_url": "https://your-domain.com/api/v1/telegram/webhook/abc123xyz...",
  "is_configured": true,
  "message": null
}
```

**Ответ когда PUBLIC_API_URL не настроен (200):**
```json
{
  "webhook_url": "",
  "is_configured": false,
  "message": "PUBLIC_API_URL не настроен. Установите переменную окружения PUBLIC_API_URL (например: https://your-domain.com или https://abc123.ngrok.io)"
}
```

**Ошибка (404) - Интеграция не найдена:**
```json
{
  "error": {
    "code": "TELEGRAM_INTEGRATION_NOT_FOUND",
    "message": "Telegram integration not found for project",
    "field": null,
    "details": {"project_id": "..."}
  }
}
```

---

### 2. Установка webhook

**Endpoint:** `POST /api/v1/telegram/{project_id}/webhook`

**Заголовки:**
```
Content-Type: application/json
Authorization: Bearer <access_token>
```

**Тело запроса:**
```json
{
  "webhook_url": "https://your-domain.com/api/v1/telegram/webhook/abc123xyz..."
}
```

**Успешный ответ (200):**
```json
{
  "success": true
}
```

**Ошибка (400) - Неверный URL:**
```json
{
  "error": {
    "code": "TELEGRAM_WEBHOOK_ERROR",
    "message": "Telegram webhook error: URL must be HTTPS",
    "field": "webhook_url",
    "details": {"reason": "URL must be HTTPS"}
  }
}
```

---

### 3. Удаление webhook

**Endpoint:** `DELETE /api/v1/telegram/{project_id}/webhook`

**Заголовки:**
```
Authorization: Bearer <access_token>
```

**Успешный ответ (200):**
```json
{
  "success": true
}
```

---

## 💻 Примеры реализации на фронтенде

### TypeScript/React пример

```typescript
// types/telegram.ts
interface WebhookUrlResponse {
  webhook_url: string;
  is_configured: boolean;
  message: string | null;
}

interface WebhookSetResponse {
  success: boolean;
}

// api/telegram.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export async function getWebhookUrl(
  projectId: string, 
  accessToken: string
): Promise<WebhookUrlResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/telegram/${projectId}/webhook-url`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get webhook URL');
  }
  
  return response.json();
}

export async function setWebhook(
  projectId: string,
  webhookUrl: string,
  accessToken: string
): Promise<WebhookSetResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/telegram/${projectId}/webhook`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ webhook_url: webhookUrl }),
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to set webhook');
  }
  
  return response.json();
}

export async function removeWebhook(
  projectId: string,
  accessToken: string
): Promise<WebhookSetResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/telegram/${projectId}/webhook`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to remove webhook');
  }
  
  return response.json();
}
```

### React компонент для кнопки "Установить webhook"

```tsx
// components/TelegramWebhookButton.tsx
import { useState } from 'react';
import { getWebhookUrl, setWebhook, removeWebhook } from '@/api/telegram';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner'; // или другая библиотека уведомлений

interface Props {
  projectId: string;
  isWebhookActive: boolean;
  onSuccess: () => void; // callback для обновления данных интеграции
}

export function TelegramWebhookButton({ projectId, isWebhookActive, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const { accessToken } = useAuth();

  const handleSetWebhook = async () => {
    if (!accessToken) {
      toast.error('Необходима авторизация');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Получаем готовый webhook URL
      const urlResponse = await getWebhookUrl(projectId, accessToken);
      
      // 2. Проверяем, настроен ли PUBLIC_API_URL
      if (!urlResponse.is_configured) {
        toast.error(urlResponse.message || 'PUBLIC_API_URL не настроен на сервере');
        return;
      }
      
      // 3. Устанавливаем webhook
      const result = await setWebhook(projectId, urlResponse.webhook_url, accessToken);
      
      if (result.success) {
        toast.success('Webhook успешно установлен!');
        onSuccess(); // Обновляем данные интеграции
      } else {
        toast.error('Не удалось установить webhook');
      }
    } catch (error) {
      console.error('Webhook error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при установке webhook');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWebhook = async () => {
    if (!accessToken) {
      toast.error('Необходима авторизация');
      return;
    }

    setLoading(true);
    
    try {
      const result = await removeWebhook(projectId, accessToken);
      
      if (result.success) {
        toast.success('Webhook успешно удалён!');
        onSuccess();
      } else {
        toast.error('Не удалось удалить webhook');
      }
    } catch (error) {
      console.error('Remove webhook error:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при удалении webhook');
    } finally {
      setLoading(false);
    }
  };

  if (isWebhookActive) {
    return (
      <button
        onClick={handleRemoveWebhook}
        disabled={loading}
        className="btn btn-outline"
      >
        {loading ? 'Удаление...' : 'Удалить webhook'}
      </button>
    );
  }

  return (
    <button
      onClick={handleSetWebhook}
      disabled={loading}
      className="btn btn-primary"
    >
      {loading ? 'Установка...' : 'Установить webhook'}
    </button>
  );
}
```

### Использование в странице интеграции

```tsx
// pages/projects/[projectId]/telegram.tsx
import { useState, useEffect } from 'react';
import { TelegramWebhookButton } from '@/components/TelegramWebhookButton';
import { getTelegramIntegration } from '@/api/telegram';

export default function TelegramIntegrationPage({ projectId }: { projectId: string }) {
  const [integration, setIntegration] = useState<TelegramIntegration | null>(null);
  const { accessToken } = useAuth();

  const fetchIntegration = async () => {
    if (!accessToken) return;
    const data = await getTelegramIntegration(projectId, accessToken);
    setIntegration(data);
  };

  useEffect(() => {
    fetchIntegration();
  }, [projectId, accessToken]);

  if (!integration) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <h1>Telegram интеграция</h1>
      
      {/* Информация о боте */}
      <div className="card">
        <p>@{integration.bot_username}</p>
        <p>Статус: {integration.is_active ? '🟢 Активен' : '🔴 Неактивен'}</p>
        <p>Webhook: {integration.is_webhook_active ? '✅ Установлен' : '❌ Не установлен'}</p>
      </div>

      {/* Кнопка управления webhook */}
      <TelegramWebhookButton
        projectId={projectId}
        isWebhookActive={integration.is_webhook_active}
        onSuccess={fetchIntegration}
      />
    </div>
  );
}
```

---

## 🔄 Полный флоу установки webhook

```
┌─────────────────────────────────────────────────────────────────┐
│                     Пользователь                                 │
│                         │                                        │
│                         ▼                                        │
│              Нажимает "Установить webhook"                       │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Frontend: GET /api/v1/telegram/{projectId}/webhook-url   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Backend: Проверяет PUBLIC_API_URL                        │   │
│  │          Формирует webhook_url с секретом                │   │
│  │          Возвращает { webhook_url, is_configured }       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                         │                                        │
│              ┌──────────┴──────────┐                            │
│              │                     │                            │
│      is_configured=false    is_configured=true                  │
│              │                     │                            │
│              ▼                     ▼                            │
│    Показать ошибку        Продолжить установку                  │
│    "PUBLIC_API_URL              │                               │
│     не настроен"                ▼                               │
│                    ┌────────────────────────────────────────┐   │
│                    │ Frontend: POST /api/v1/telegram/       │   │
│                    │           {projectId}/webhook          │   │
│                    │ Body: { webhook_url: "..." }           │   │
│                    └────────────────────────────────────────┘   │
│                                 │                               │
│                                 ▼                               │
│                    ┌────────────────────────────────────────┐   │
│                    │ Backend: Вызывает Telegram API         │   │
│                    │          setWebhook(url)               │   │
│                    │          Обновляет is_webhook_active   │   │
│                    └────────────────────────────────────────┘   │
│                                 │                               │
│                                 ▼                               │
│                    Показать "Webhook установлен!"               │
│                    Обновить UI (is_webhook_active=true)         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Обработка ошибок

### Типичные ошибки и их обработка

| Код ошибки | Причина | Действие на фронтенде |
|------------|---------|----------------------|
| `TELEGRAM_INTEGRATION_NOT_FOUND` | Интеграция не существует | Показать "Сначала создайте интеграцию" |
| `TELEGRAM_WEBHOOK_ERROR` | Ошибка установки (например, URL не HTTPS) | Показать сообщение из `error.message` |
| `VALIDATION_ERROR` | Неверный формат запроса | Проверить, что передаётся `webhook_url` в теле |
| 401/403 | Нет авторизации/прав | Показать "Нет доступа" |

### Пример обработки ошибок

```typescript
try {
  const urlResponse = await getWebhookUrl(projectId, accessToken);
  
  if (!urlResponse.is_configured) {
    // PUBLIC_API_URL не настроен - показать сообщение админу
    showAdminNotification(
      'Для работы webhook необходимо настроить PUBLIC_API_URL на сервере'
    );
    return;
  }
  
  await setWebhook(projectId, urlResponse.webhook_url, accessToken);
  
} catch (error: any) {
  const errorCode = error.response?.data?.error?.code;
  
  switch (errorCode) {
    case 'TELEGRAM_INTEGRATION_NOT_FOUND':
      toast.error('Сначала создайте Telegram интеграцию');
      break;
    case 'TELEGRAM_WEBHOOK_ERROR':
      toast.error(`Ошибка Telegram: ${error.response?.data?.error?.message}`);
      break;
    case 'FORBIDDEN':
      toast.error('У вас нет прав для этой операции');
      break;
    default:
      toast.error('Произошла ошибка при установке webhook');
  }
}
```

---

## 🧪 Тестирование

### Для локальной разработки

1. **Запустите ngrok:**
   ```bash
   ngrok http 8000
   ```

2. **Установите PUBLIC_API_URL:**
   ```env
   PUBLIC_API_URL=https://abc123.ngrok-free.app
   ```

3. **Перезапустите бэкенд**

4. **Проверьте через UI или API:**
   ```bash
   # Получить webhook URL
   curl -X GET "http://localhost:8000/api/v1/telegram/{projectId}/webhook-url" \
     -H "Authorization: Bearer YOUR_TOKEN"
   
   # Ответ должен содержать webhook_url с ngrok доменом
   ```

### Для продакшена

1. Установите `PUBLIC_API_URL` на ваш реальный домен с HTTPS
2. Убедитесь, что домен доступен из интернета
3. Проверьте SSL сертификат

---

## 📝 Чек-лист для фронтенд разработчика

- [ ] Импортировать API функции (`getWebhookUrl`, `setWebhook`, `removeWebhook`)
- [ ] Создать компонент кнопки webhook с обработкой состояний (loading, error, success)
- [ ] Реализовать двухшаговый процесс: получение URL → установка webhook
- [ ] Обработать случай `is_configured: false` (показать сообщение админу)
- [ ] Добавить обработку ошибок с понятными сообщениями
- [ ] Обновлять UI после успешной установки/удаления webhook
- [ ] Показывать текущий статус webhook (`is_webhook_active`)

---

## 🔗 Связанные endpoint'ы

| Endpoint | Описание |
|----------|----------|
| `GET /api/v1/telegram/{project_id}` | Получить данные интеграции |
| `POST /api/v1/telegram/{project_id}` | Создать интеграцию |
| `PUT /api/v1/telegram/{project_id}` | Обновить интеграцию |
| `DELETE /api/v1/telegram/{project_id}` | Удалить интеграцию |
| `GET /api/v1/telegram/{project_id}/webhook-url` | **Получить webhook URL** |
| `POST /api/v1/telegram/{project_id}/webhook` | **Установить webhook** |
| `DELETE /api/v1/telegram/{project_id}/webhook` | **Удалить webhook** |

---

**Дата создания:** 5 января 2026  
**Версия:** 1.0

