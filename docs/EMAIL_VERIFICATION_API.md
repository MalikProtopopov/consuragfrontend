# Email Verification API Documentation

Документация для фронтенд-разработчика по интеграции системы подтверждения email.

## Содержание

1. [Обзор](#обзор)
2. [Endpoints](#endpoints)
3. [Flow регистрации](#flow-регистрации)
4. [Flow подтверждения email](#flow-подтверждения-email)
5. [Обработка ошибок](#обработка-ошибок)
6. [UI/UX рекомендации](#uiux-рекомендации)
7. [Примеры кода](#примеры-кода)

---

## Обзор

При регистрации пользователь автоматически получает письмо с ссылкой для подтверждения email. Ссылка действительна **24 часа**. После подтверждения поле `is_email_verified` становится `true`.

### Основные моменты:
- Email отправляется автоматически при регистрации
- Ссылка в письме ведет на фронтенд: `{FRONTEND_URL}/verify-email?token={jwt_token}`
- Фронтенд должен извлечь токен и вызвать API для подтверждения
- Повторную отправку можно запросить не чаще 1 раза в 5 минут

---

## Endpoints

### 1. Подтверждение email

```
POST /api/v1/auth/verify-email/{token}
```

Подтверждает email адрес по токену из письма.

**Параметры пути:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| `token` | string | JWT токен из ссылки в письме |

**Успешный ответ (200):**
```json
{
  "message": "Email verified successfully",
  "email": "user@example.com"
}
```

**Ошибки:**

| Код | HTTP Status | Описание |
|-----|-------------|----------|
| `AUTH_EMAIL_ALREADY_VERIFIED` | 400 | Email уже подтвержден |
| `AUTH_INVALID_TOKEN` | 401 | Невалидный токен |
| `AUTH_TOKEN_EXPIRED` | 401 | Токен истек |
| `AUTH_USER_NOT_FOUND` | 404 | Пользователь не найден |

---

### 2. Повторная отправка письма подтверждения

```
POST /api/v1/auth/resend-verification
```

Отправляет новое письмо с ссылкой подтверждения.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Успешный ответ (200):**
```json
{
  "message": "Verification email sent"
}
```

**Ошибки:**

| Код | HTTP Status | Описание |
|-----|-------------|----------|
| `AUTH_EMAIL_ALREADY_VERIFIED` | 400 | Email уже подтвержден |
| `AUTH_USER_NOT_FOUND` | 404 | Пользователь не найден |
| `AUTH_EMAIL_RESEND_COOLDOWN` | 429 | Слишком частые запросы |

**Пример ошибки cooldown:**
```json
{
  "error": {
    "code": "AUTH_EMAIL_RESEND_COOLDOWN",
    "message": "Please wait 180 seconds before requesting a new verification email",
    "field": null,
    "details": {
      "wait_seconds": 180
    }
  }
}
```

---

## Flow регистрации

```
┌─────────────────────────────────────────────────────────────────┐
│                      FLOW РЕГИСТРАЦИИ                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Пользователь заполняет форму регистрации                   │
│                         │                                       │
│                         ▼                                       │
│   2. POST /api/v1/auth/register                                 │
│                         │                                       │
│                         ▼                                       │
│   3. Ответ 201: { id, email, is_email_verified: false, ... }    │
│                         │                                       │
│                         ▼                                       │
│   4. Показать сообщение: "Проверьте почту для подтверждения"    │
│      + Кнопка "Отправить письмо повторно"                       │
│                         │                                       │
│                         ▼                                       │
│   5. Пользователь получает письмо на email                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Рекомендуемый UI после регистрации:

```
┌──────────────────────────────────────────┐
│                                          │
│     ✉️ Подтвердите ваш email             │
│                                          │
│  Мы отправили письмо на:                 │
│  user@example.com                        │
│                                          │
│  Перейдите по ссылке в письме для        │
│  активации аккаунта.                     │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │   Отправить письмо повторно       │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Не получили письмо? Проверьте папку     │
│  "Спам" или запросите повторную отправку │
│                                          │
└──────────────────────────────────────────┘
```

---

## Flow подтверждения email

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLOW ПОДТВЕРЖДЕНИЯ EMAIL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1. Пользователь переходит по ссылке из письма:                │
│      https://your-frontend.com/verify-email?token=eyJ...        │
│                         │                                       │
│                         ▼                                       │
│   2. Фронтенд извлекает token из URL                            │
│                         │                                       │
│                         ▼                                       │
│   3. POST /api/v1/auth/verify-email/{token}                     │
│                         │                                       │
│              ┌──────────┴──────────┐                            │
│              ▼                     ▼                            │
│         Успех (200)           Ошибка (4xx)                      │
│              │                     │                            │
│              ▼                     ▼                            │
│   4a. Показать "Email подтвержден!"  4b. Показать ошибку        │
│       Кнопка "Войти в систему"       и предложить решение       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Пример страницы подтверждения (React):

```tsx
// pages/verify-email.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Токен не найден в URL');
      return;
    }
    
    verifyEmail(token);
  }, [token]);
  
  async function verifyEmail(token: string) {
    try {
      const response = await fetch(`/api/v1/auth/verify-email/${token}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setStatus('success');
      } else {
        const data = await response.json();
        setStatus('error');
        setError(getErrorMessage(data.error.code));
      }
    } catch (e) {
      setStatus('error');
      setError('Ошибка сети. Попробуйте позже.');
    }
  }
  
  function getErrorMessage(code: string): string {
    switch (code) {
      case 'AUTH_EMAIL_ALREADY_VERIFIED':
        return 'Email уже подтвержден. Вы можете войти в систему.';
      case 'AUTH_INVALID_TOKEN':
      case 'AUTH_TOKEN_EXPIRED':
        return 'Ссылка недействительна или истекла. Запросите новое письмо.';
      case 'AUTH_USER_NOT_FOUND':
        return 'Пользователь не найден.';
      default:
        return 'Произошла ошибка. Попробуйте позже.';
    }
  }
  
  if (status === 'loading') {
    return <div>Подтверждаем ваш email...</div>;
  }
  
  if (status === 'success') {
    return (
      <div>
        <h1>✅ Email подтвержден!</h1>
        <p>Теперь вы можете войти в систему.</p>
        <button onClick={() => navigate('/login')}>
          Войти
        </button>
      </div>
    );
  }
  
  return (
    <div>
      <h1>❌ Ошибка подтверждения</h1>
      <p>{error}</p>
      <button onClick={() => navigate('/resend-verification')}>
        Отправить письмо повторно
      </button>
    </div>
  );
}
```

---

## Обработка ошибок

### Таблица всех кодов ошибок

| Код ошибки | HTTP | Описание | Действие фронтенда |
|------------|------|----------|-------------------|
| `AUTH_EMAIL_ALREADY_VERIFIED` | 400 | Email уже подтвержден | Показать "Email уже подтвержден" + кнопка "Войти" |
| `AUTH_INVALID_TOKEN` | 401 | Токен невалидный | Показать "Ссылка недействительна" + кнопка "Отправить повторно" |
| `AUTH_TOKEN_EXPIRED` | 401 | Токен истек | Показать "Срок действия ссылки истек" + кнопка "Отправить повторно" |
| `AUTH_USER_NOT_FOUND` | 404 | Пользователь не найден | Показать "Пользователь не найден" + кнопка "Регистрация" |
| `AUTH_EMAIL_RESEND_COOLDOWN` | 429 | Слишком частые запросы | Показать таймер с оставшимся временем |
| `VALIDATION_ERROR` | 422 | Ошибка валидации | Показать ошибку валидации email |

---

## UI/UX рекомендации

### 1. Профиль пользователя

Показывать статус верификации email:

```tsx
function UserProfile({ user }) {
  return (
    <div>
      <p>Email: {user.email}</p>
      {user.is_email_verified ? (
        <span className="verified">✓ Подтвержден</span>
      ) : (
        <div className="unverified">
          <span>⚠️ Email не подтвержден</span>
          <button onClick={resendVerification}>
            Отправить письмо подтверждения
          </button>
        </div>
      )}
    </div>
  );
}
```

### 2. Кнопка повторной отправки с таймером

```tsx
function ResendButton({ email }) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  
  async function handleResend() {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setCooldown(300); // 5 минут
      } else {
        const data = await response.json();
        if (data.error.code === 'AUTH_EMAIL_RESEND_COOLDOWN') {
          setCooldown(data.error.details.wait_seconds);
        }
      }
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(c => c - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);
  
  if (cooldown > 0) {
    const minutes = Math.floor(cooldown / 60);
    const seconds = cooldown % 60;
    return (
      <button disabled>
        Отправить повторно ({minutes}:{seconds.toString().padStart(2, '0')})
      </button>
    );
  }
  
  return (
    <button onClick={handleResend} disabled={loading}>
      {loading ? 'Отправка...' : 'Отправить письмо повторно'}
    </button>
  );
}
```

### 3. Блокировка функций для неподтвержденных пользователей (опционально)

```tsx
function ProtectedFeature({ user, children }) {
  if (!user.is_email_verified) {
    return (
      <div className="email-required">
        <p>Для использования этой функции подтвердите ваш email.</p>
        <ResendButton email={user.email} />
      </div>
    );
  }
  
  return children;
}
```

---

## Примеры кода

### Fetch API

```javascript
// Подтверждение email
async function verifyEmail(token) {
  const response = await fetch(`/api/v1/auth/verify-email/${token}`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}

// Повторная отправка
async function resendVerification(email) {
  const response = await fetch('/api/v1/auth/resend-verification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }
  
  return response.json();
}
```

### Axios

```javascript
import axios from 'axios';

// Подтверждение email
export const verifyEmail = async (token) => {
  const { data } = await axios.post(`/api/v1/auth/verify-email/${token}`);
  return data;
};

// Повторная отправка
export const resendVerification = async (email) => {
  const { data } = await axios.post('/api/v1/auth/resend-verification', { email });
  return data;
};
```

---

## Переводы сообщений

Для локализации используйте следующие ключи:

```json
{
  "email_verification": {
    "title": "Подтвердите ваш email",
    "description": "Мы отправили письмо на {email}. Перейдите по ссылке в письме для активации аккаунта.",
    "resend_button": "Отправить письмо повторно",
    "resend_cooldown": "Отправить повторно через {time}",
    "check_spam": "Не получили письмо? Проверьте папку \"Спам\"",
    "success_title": "Email подтвержден!",
    "success_description": "Теперь вы можете войти в систему.",
    "error_already_verified": "Email уже подтвержден. Вы можете войти в систему.",
    "error_invalid_token": "Ссылка недействительна. Запросите новое письмо.",
    "error_expired_token": "Срок действия ссылки истек. Запросите новое письмо.",
    "error_user_not_found": "Пользователь не найден.",
    "error_cooldown": "Подождите {seconds} секунд перед повторной отправкой."
  }
}
```

---

## Тестирование

Для тестирования используйте:

1. **Регистрация** → проверьте что `is_email_verified: false`
2. **Проверьте SMTP** → письмо должно прийти (или проверьте логи)
3. **Извлеките токен** из ссылки в письме
4. **Вызовите verify-email** с токеном
5. **Проверьте профиль** → `is_email_verified: true`

Для тестирования без SMTP можно временно извлекать токены из логов сервера.

