# Руководство по деплою лендинга на parmenid.tech

## Обзор инфраструктуры

На сервере уже работает:
- **admin.parmenid.tech** — админ-панель (Next.js, порт 3000)
- **Nginx** — reverse proxy для маршрутизации трафика
- **Let's Encrypt** — SSL сертификаты

Задача: добавить лендинг на **parmenid.tech** (основной домен).

---

## Архитектура

```
                    ┌─────────────────────────────────────────┐
                    │              Nginx (80/443)             │
                    │         Reverse Proxy + SSL             │
                    └─────────────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
                    ▼                                     ▼
        ┌───────────────────────┐           ┌───────────────────────┐
        │   parmenid.tech       │           │  admin.parmenid.tech  │
        │   (Landing Page)      │           │   (Admin Panel)       │
        │   порт 3001 или       │           │   порт 3000           │
        │   статические файлы   │           │                       │
        └───────────────────────┘           └───────────────────────┘
```

---

## Вариант 1: Статический сайт (рекомендуется для простого лендинга)

### Шаг 1: Подготовка проекта

Создайте проект с любым удобным инструментом:

```bash
# Vite (React/Vue/Vanilla)
npm create vite@latest parmenid-landing

# Astro (отлично для статики)
npm create astro@latest parmenid-landing

# Или просто HTML/CSS/JS
mkdir parmenid-landing && cd parmenid-landing
touch index.html style.css
```

### Шаг 2: Сборка проекта

```bash
cd parmenid-landing
npm install
npm run build
```

После сборки у вас будет папка `dist/` (или `build/`, `out/` в зависимости от инструмента).

### Шаг 3: Загрузка на сервер

```bash
# Через SCP
scp -r dist/* user@your-server:/var/www/parmenid-landing/

# Или через rsync (лучше для обновлений)
rsync -avz --delete dist/ user@your-server:/var/www/parmenid-landing/
```

### Шаг 4: Настройка Nginx

Создайте файл `/etc/nginx/conf.d/landing.conf`:

```nginx
# parmenid.tech - Landing Page (статика)

server {
    listen 80;
    server_name parmenid.tech www.parmenid.tech;

    # ACME challenge для Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Редирект HTTP -> HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name parmenid.tech www.parmenid.tech;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/parmenid.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parmenid.tech/privkey.pem;

    # Корневая директория со статикой
    root /var/www/parmenid-landing;
    index index.html;

    # Gzip сжатие
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Кэширование статики
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback (если используете роутинг на клиенте)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## Вариант 2: Node.js приложение (Next.js, Nuxt, etc.)

### Шаг 1: Подготовка проекта

```bash
npx create-next-app@latest parmenid-landing
cd parmenid-landing
```

### Шаг 2: Docker (рекомендуется)

Создайте `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
```

Создайте `docker-compose.yml`:

```yaml
version: '3.8'

services:
  landing:
    build: .
    container_name: parmenid-landing
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
```

### Шаг 3: Деплой

```bash
# На сервере
cd /path/to/parmenid-landing
docker-compose up -d --build
```

### Шаг 4: Настройка Nginx

Создайте файл `/etc/nginx/conf.d/landing.conf`:

```nginx
# parmenid.tech - Landing Page (Node.js)

upstream landing {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name parmenid.tech www.parmenid.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    http2 on;
    server_name parmenid.tech www.parmenid.tech;

    ssl_certificate /etc/letsencrypt/live/parmenid.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parmenid.tech/privkey.pem;

    # Proxy к Node.js
    location / {
        proxy_pass http://landing;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Кэширование статики Next.js
    location /_next/static {
        proxy_pass http://landing;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

---

## Docker: подробное руководство

### Основы Docker

Docker позволяет упаковать приложение со всеми зависимостями в контейнер, который одинаково работает на любом сервере.

**Ключевые понятия:**
- **Image** — образ (шаблон) приложения
- **Container** — запущенный экземпляр образа
- **Dockerfile** — инструкция для сборки образа
- **docker-compose** — инструмент для управления несколькими контейнерами

### Dockerfile с комментариями

```dockerfile
# ===========================================
# ЭТАП 1: Сборка (builder)
# ===========================================
FROM node:20-alpine AS builder

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем файлы зависимостей отдельно (для кэширования слоёв)
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем проект
RUN npm run build

# ===========================================
# ЭТАП 2: Запуск (runner) — минимальный образ
# ===========================================
FROM node:20-alpine AS runner

WORKDIR /app

# Только production окружение
ENV NODE_ENV=production

# Копируем только необходимое из builder
# Для Next.js standalone:
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Порт приложения
EXPOSE 3001
ENV PORT=3001

# Запуск
CMD ["node", "server.js"]
```

> **Важно:** Для Next.js standalone режима добавьте в `next.config.js`:
> ```js
> module.exports = {
>   output: 'standalone',
> }
> ```

### docker-compose.yml с комментариями

```yaml
version: '3.8'

services:
  landing:
    # Сборка из текущей директории
    build:
      context: .
      dockerfile: Dockerfile
    
    # Имя контейнера (для удобства)
    container_name: parmenid-landing
    
    # Автоперезапуск при падении
    restart: unless-stopped
    
    # Проброс портов: host:container
    ports:
      - "3001:3001"
    
    # Переменные окружения
    environment:
      - NODE_ENV=production
      - API_URL=https://api.parmenid.tech
    
    # Или из файла
    # env_file:
    #   - .env.production
    
    # Healthcheck — проверка работоспособности
    healthcheck:
      test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    
    # Лимиты ресурсов (опционально)
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

### Переменные окружения

**Способ 1: В docker-compose.yml**

```yaml
environment:
  - NODE_ENV=production
  - API_URL=https://api.parmenid.tech
```

**Способ 2: Файл .env**

Создайте `.env.production`:
```env
NODE_ENV=production
API_URL=https://api.parmenid.tech
NEXT_PUBLIC_GA_ID=UA-XXXXXXXX
```

В docker-compose.yml:
```yaml
env_file:
  - .env.production
```

**Способ 3: При запуске**

```bash
API_URL=https://api.parmenid.tech docker-compose up -d
```

### Работа с несколькими проектами

Если админка тоже в Docker, можно объединить в общую сеть:

```yaml
# docker-compose.yml для лендинга
version: '3.8'

services:
  landing:
    build: .
    container_name: parmenid-landing
    restart: unless-stopped
    networks:
      - parmenid-network
    ports:
      - "3001:3001"

networks:
  parmenid-network:
    external: true  # Сеть создана отдельно
```

Создание общей сети:
```bash
docker network create parmenid-network
```

### Команды Docker

#### Основные команды

```bash
# Сборка и запуск
docker-compose up -d --build

# Только запуск (без пересборки)
docker-compose up -d

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Перезапуск одного сервиса
docker-compose restart landing

# Пересборка без кэша
docker-compose build --no-cache
```

#### Просмотр состояния

```bash
# Список запущенных контейнеров
docker ps

# Все контейнеры (включая остановленные)
docker ps -a

# Статус сервисов docker-compose
docker-compose ps

# Использование ресурсов
docker stats
```

#### Логи

```bash
# Логи контейнера
docker logs parmenid-landing

# Логи в реальном времени
docker logs -f parmenid-landing

# Последние 100 строк
docker logs --tail 100 parmenid-landing

# С временными метками
docker logs -t parmenid-landing

# Логи через docker-compose
docker-compose logs -f
```

#### Отладка

```bash
# Зайти внутрь контейнера
docker exec -it parmenid-landing sh

# Выполнить команду в контейнере
docker exec parmenid-landing ls -la

# Посмотреть переменные окружения
docker exec parmenid-landing env

# Проверить сетевые настройки
docker inspect parmenid-landing | grep -A 20 "NetworkSettings"
```

#### Очистка

```bash
# Удалить остановленные контейнеры
docker container prune

# Удалить неиспользуемые образы
docker image prune

# Удалить всё неиспользуемое
docker system prune -a

# Посмотреть занимаемое место
docker system df
```

### CI/CD: автоматический деплой

#### GitHub Actions

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy Landing

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/parmenid-landing
            git pull origin main
            docker-compose up -d --build
            docker image prune -f
```

Добавьте секреты в GitHub:
- `SERVER_HOST` — IP сервера
- `SERVER_USER` — пользователь SSH
- `SSH_PRIVATE_KEY` — приватный ключ

#### Простой деплой скрипт

Создайте `deploy.sh` на сервере:

```bash
#!/bin/bash
set -e

cd /opt/parmenid-landing

echo "📥 Pulling latest changes..."
git pull origin main

echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deploy complete!"
docker-compose ps
```

Запуск:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Структура проекта с Docker

```
parmenid-landing/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD
├── public/
│   └── ...
├── src/
│   └── ...
├── .dockerignore               # Исключения для Docker
├── .env.example                # Пример переменных
├── .env.production             # Продакшн переменные (в .gitignore!)
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.js
├── package.json
└── README.md
```

**.dockerignore** (обязательно создать):

```
node_modules
.next
.git
.gitignore
*.md
.env*
!.env.example
```

### Мониторинг и Health Checks

#### Проверка здоровья в docker-compose

```yaml
healthcheck:
  test: ["CMD", "wget", "-q", "--spider", "http://localhost:3001/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

#### Просмотр статуса

```bash
# Статус healthcheck
docker inspect --format='{{.State.Health.Status}}' parmenid-landing

# Детали последних проверок
docker inspect --format='{{json .State.Health}}' parmenid-landing | jq
```

### Типичные проблемы Docker

#### Контейнер не запускается

```bash
# Посмотреть логи
docker logs parmenid-landing

# Проверить статус
docker ps -a | grep landing
```

#### Порт уже занят

```bash
# Найти что занимает порт
sudo lsof -i :3001

# Убить процесс
sudo kill -9 <PID>
```

#### Нет места на диске

```bash
# Проверить место
df -h

# Очистить Docker
docker system prune -a --volumes
```

#### Изменения не применяются

```bash
# Пересобрать без кэша
docker-compose build --no-cache
docker-compose up -d
```

---

## Получение SSL сертификата

### Первый раз (без сертификата)

1. Сначала создайте временный конфиг только для HTTP:

```nginx
# /etc/nginx/conf.d/landing.conf (временный)
server {
    listen 80;
    server_name parmenid.tech www.parmenid.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'Landing coming soon';
        add_header Content-Type text/plain;
    }
}
```

2. Перезагрузите nginx:

```bash
sudo nginx -t
sudo nginx -s reload
```

3. Получите сертификат:

```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d parmenid.tech \
  -d www.parmenid.tech \
  --email your@email.com \
  --agree-tos \
  --non-interactive
```

4. Замените конфиг на полный (с HTTPS) и перезагрузите nginx.

### Автопродление

Certbot обычно настраивает cron автоматически. Проверьте:

```bash
sudo certbot renew --dry-run
```

---

## Команды для работы с сервером

### SSH подключение

```bash
ssh user@your-server-ip
# или
ssh user@parmenid.tech
```

### Проверка конфигурации Nginx

```bash
sudo nginx -t                    # Проверить синтаксис
sudo nginx -s reload             # Перезагрузить конфиг
sudo systemctl restart nginx     # Перезапустить nginx
sudo systemctl status nginx      # Статус
```

### Просмотр логов

```bash
# Nginx логи
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Docker логи (если используете)
docker logs -f parmenid-landing
```

### Полезные команды Docker

```bash
docker ps                        # Список контейнеров
docker-compose up -d --build     # Пересобрать и запустить
docker-compose down              # Остановить
docker-compose logs -f           # Логи
```

---

## Чеклист деплоя

- [ ] Проект собирается локально без ошибок
- [ ] DNS записи настроены (A запись для parmenid.tech → IP сервера)
- [ ] Файлы загружены на сервер
- [ ] SSL сертификат получен
- [ ] Конфиг Nginx создан и проверен (`nginx -t`)
- [ ] Nginx перезагружен
- [ ] Сайт открывается по HTTPS
- [ ] Редирект с HTTP на HTTPS работает
- [ ] Редирект с www на non-www (или наоборот) настроен

---

## Структура файлов на сервере

```
/var/www/
├── certbot/                     # Для ACME challenge
│   └── .well-known/
│       └── acme-challenge/
└── parmenid-landing/            # Статика лендинга (Вариант 1)
    ├── index.html
    ├── assets/
    └── ...

/etc/nginx/
├── nginx.conf                   # Основной конфиг
└── conf.d/
    ├── admin.conf               # admin.parmenid.tech
    └── landing.conf             # parmenid.tech (создать)

/etc/letsencrypt/live/
├── admin.parmenid.tech/         # Сертификаты админки
└── parmenid.tech/               # Сертификаты лендинга (получить)
```

---

## Возможные проблемы

### 502 Bad Gateway
- Проверьте, запущен ли Node.js/Docker: `docker ps` или `pm2 list`
- Проверьте порт в конфиге nginx совпадает с портом приложения

### SSL ошибки
- Убедитесь, что сертификат получен: `ls /etc/letsencrypt/live/parmenid.tech/`
- Проверьте пути в nginx конфиге

### Сайт не открывается
- Проверьте DNS: `dig parmenid.tech`
- Проверьте firewall: `sudo ufw status`
- Порты 80 и 443 должны быть открыты

### Изменения не применяются
- Очистите кэш браузера (Ctrl+Shift+R)
- Убедитесь что nginx перезагружен: `sudo nginx -s reload`

---

## Контакты и доступы

| Ресурс | Данные |
|--------|--------|
| Сервер | `ssh user@server-ip` |
| Домен | parmenid.tech |
| DNS | (указать провайдера) |
| SSL | Let's Encrypt (auto-renewal) |

