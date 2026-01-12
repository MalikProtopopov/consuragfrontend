# Инструкция по установке и запуску Email Verification

## Получение изменений

### 1. Переключиться на ветку с email verification

```bash
git fetch origin
git checkout feature/email-verification
```

### 2. Установить зависимости (если еще не установлены)

```bash
npm install
```

## Локальная разработка

### Запуск dev сервера

```bash
npm run dev
```

Приложение будет доступно по адресу: `http://localhost:3000`

### Проверка типов

```bash
npx tsc --noEmit
```

### Линтинг

```bash
npm run lint
```

## Запуск через Docker (Make)

### Development режим (HTTP)

```bash
# Создать .env.dev если его нет
make env-dev

# Запустить dev сервер
make dev

# Или с пересборкой
make dev-build
```

Приложение будет доступно по адресу: `http://83.217.221.77`

### Production режим (HTTPS)

```bash
# Создать .env.prod если его нет
make env-prod

# Инициализировать SSL сертификат (только первый раз)
make ssl-init

# Запустить production сервер
make prod

# Или с пересборкой
make prod-build
```

Приложение будет доступно по адресу: `https://admin.parmenid.tech`

## Полезные команды

### Просмотр логов

```bash
# Логи dev сервера
make logs-dev

# Логи production сервера
make logs-prod

# Автоматический выбор (dev или prod)
make logs
```

### Остановка контейнеров

```bash
make down
```

### Просмотр статуса контейнеров

```bash
make ps
```

### Полная очистка

```bash
make clean
```

## Тестирование Email Verification

### 1. Регистрация нового пользователя

1. Перейдите на `/register`
2. Заполните форму регистрации
3. После регистрации вы увидите экран "Подтвердите ваш email"
4. Проверьте почту на указанный email адрес

### 2. Подтверждение email

1. Перейдите по ссылке из письма (или используйте токен вручную)
2. Ссылка ведет на `/verify-email?token=<jwt_token>`
3. Страница автоматически подтвердит email
4. После успешного подтверждения можно войти в систему

### 3. Повторная отправка письма

- На странице регистрации (после успешной регистрации)
- На странице профиля (если email не подтвержден)
- На странице ошибки верификации

Кнопка "Отправить письмо повторно" имеет cooldown 5 минут.

### 4. Проверка статуса в профиле

1. Войдите в систему
2. Перейдите в `/settings/profile`
3. Если email не подтвержден, вы увидите предупреждение
4. Используйте кнопку для повторной отправки письма

## API Endpoints

### Подтверждение email

```
POST /api/v1/auth/verify-email/{token}
```

### Повторная отправка письма

```
POST /api/v1/auth/resend-verification
Body: { "email": "user@example.com" }
```

## Структура изменений

- `src/app/(auth)/verify-email/page.tsx` - страница подтверждения email
- `src/features/auth/ui/ResendVerificationButton.tsx` - компонент кнопки повторной отправки
- `src/features/auth/ui/RegisterForm.tsx` - обновленная форма регистрации
- `src/entities/auth/api/authApi.ts` - API методы для верификации
- `src/entities/auth/model/useAuth.ts` - хуки для верификации
- `src/shared/config/apiEndpoints.ts` - новые endpoints
- `src/shared/config/routes.ts` - новый роут
- `middleware.ts` - обновление для публичного доступа к /verify-email

## Troubleshooting

### Проблемы с Docker

Если контейнеры не запускаются:

```bash
# Остановить все контейнеры
make down

# Очистить все
make clean

# Пересобрать и запустить
make dev-build  # или make prod-build
```

### Проблемы с SSL

Если SSL сертификат не работает:

```bash
# Проверить наличие сертификата
ls -la certbot/conf/live/admin.parmenid.tech/

# Инициализировать заново
make ssl-init
```

### Проблемы с зависимостями

```bash
# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install
```

## Создание Pull Request

После тестирования можно создать Pull Request:

1. Перейдите по ссылке: https://github.com/MalikProtopopov/consuragfrontend/pull/new/feature/email-verification
2. Или используйте GitHub CLI:

```bash
gh pr create --base main --head feature/email-verification --title "feat: Email Verification Flow" --body "Добавлен полный flow верификации email согласно документации EMAIL_VERIFICATION_API.md"
```

