# Руководство по деплою Next.js проекта

Полная инструкция по настройке и деплою Next.js приложения с Docker, Nginx и SSL.

---

## Содержание

1. [Требования](#требования)
2. [Архитектура проекта](#архитектура-проекта)
3. [Структура файлов](#структура-файлов)
4. [Конфигурационные файлы](#конфигурационные-файлы)
5. [Первоначальная настройка сервера](#первоначальная-настройка-сервера)
6. [Настройка проекта](#настройка-проекта)
7. [Деплой Development](#деплой-development)
8. [Деплой Production](#деплой-production)
9. [Makefile команды](#makefile-команды)
10. [Обновление проекта](#обновление-проекта)
11. [Troubleshooting](#troubleshooting)

---

## Требования

### На сервере должно быть установлено:

```bash
# Docker (версия 20+)
docker --version

# Docker Compose (как плагин, НЕ docker-compose)
docker compose version

# Git
git --version

# Make (опционально, но рекомендуется)
make --version
```

### Установка Docker на Ubuntu/Debian:

```bash
# Обновляем пакеты
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com | sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Перелогиниваемся или выполняем
newgrp docker

# Проверяем
docker --version
docker compose version
```

### Системные требования:

| Параметр | Minimum | Рекомендуется |
|----------|---------|---------------|
| CPU | 1 core | 2+ cores |
| RAM | 1 GB | 2+ GB |
| Disk | 10 GB | 20+ GB |
| OS | Ubuntu 20.04+ | Ubuntu 22.04 |

---

## Архитектура проекта

```
┌─────────────────────────────────────────────────────────┐
│                    Internet                              │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Nginx (контейнер)                           │
│              Порты: 80, 443                              │
│              - SSL termination                           │
│              - Reverse proxy                             │
│              - Gzip compression                          │
│              - Static files caching                      │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼ (внутренняя сеть Docker)
┌─────────────────────────────────────────────────────────┐
│              Next.js App (контейнер)                     │
│              Порт: 3000 (внутренний)                     │
│              - SSR/SSG                                   │
│              - API routes                                │
│              - Standalone mode                           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Certbot (контейнер)                         │
│              - SSL сертификаты Let's Encrypt             │
│              - Автоматическое продление                  │
└─────────────────────────────────────────────────────────┘
```

---

## Структура файлов

```
project-root/
├── .env.dev                    # Переменные для dev (создать)
├── .env.prod                   # Переменные для prod (создать)
├── .env.dev.example            # Пример dev переменных
├── .env.prod.example           # Пример prod переменных
│
├── Dockerfile                  # Сборка Next.js приложения
├── docker-compose.dev.yml      # Dev конфигурация (HTTP)
├── docker-compose.prod.yml     # Prod конфигурация (HTTPS + SSL)
│
├── Makefile                    # Удобные команды
│
├── nginx/
│   ├── nginx.conf              # Основной конфиг (prod)
│   ├── nginx-dev.conf          # Dev конфиг (HTTP only)
│   ├── nginx-ssl-init.conf     # Временный для получения SSL
│   └── conf.d/
│       └── admin.conf          # Конфиг сайта (prod)
│
├── scripts/
│   └── init-ssl.sh             # Скрипт получения SSL
│
├── certbot/                    # Создаётся автоматически
│   ├── conf/                   # SSL сертификаты
│   └── www/                    # ACME challenge
│
├── next.config.ts              # Конфиг Next.js (важно: output: "standalone")
├── package.json
└── src/
    └── ...
```

---

## Конфигурационные файлы

### 1. Dockerfile

```dockerfile
# Build stage - установка зависимостей
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Build stage - сборка приложения
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Переменные окружения для сборки (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage - минимальный образ
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Безопасность: non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Standalone output (важно!)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### 2. next.config.ts (ВАЖНО!)

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ОБЯЗАТЕЛЬНО для Docker!
  output: "standalone",
  
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
```

> ⚠️ **Без `output: "standalone"` Docker-образ не будет работать!**

### 3. docker-compose.dev.yml (Development)

```yaml
# Development: только HTTP, порт 80
# Запуск: docker compose -f docker-compose.dev.yml up -d --build

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.example.com}
    container_name: myapp_dev
    restart: unless-stopped
    expose:
      - "3000"
    env_file:
      - .env.dev
    networks:
      - frontend_network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    container_name: myapp_nginx_dev
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx-dev.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app
    networks:
      - frontend_network

networks:
  frontend_network:
    driver: bridge
```

### 4. docker-compose.prod.yml (Production)

```yaml
# Production: HTTPS + SSL + автопродление сертификата
# Запуск: docker compose -f docker-compose.prod.yml up -d --build

x-app-common: &app-common
  restart: always
  networks:
    - frontend_network

services:
  app:
    <<: *app-common
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.example.com}
    container_name: myapp_prod
    expose:
      - "3000"
    env_file:
      - .env.prod
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    <<: *app-common
    image: nginx:alpine
    container_name: myapp_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - ./certbot/conf:/etc/letsencrypt:ro
      - ./certbot/www:/var/www/certbot:ro
    depends_on:
      - app

  certbot:
    image: certbot/certbot
    container_name: myapp_certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    # Автопродление каждые 12 часов
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
    networks:
      - frontend_network

networks:
  frontend_network:
    driver: bridge
```

### 5. nginx/nginx-dev.conf (Development)

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml;

    upstream nextjs {
        server app:3000;
    }

    server {
        listen 80;
        server_name _;  # Любой домен/IP

        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;

        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /_next/static {
            proxy_pass http://nextjs;
            proxy_cache_valid 200 365d;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
    }
}
```

### 6. nginx/nginx.conf (Production - основной)

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/javascript application/json application/xml
               application/x-javascript font/woff font/woff2;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    upstream nextjs {
        server app:3000;
    }

    # Подключаем конфиги сайтов
    include /etc/nginx/conf.d/*.conf;
}
```

### 7. nginx/conf.d/admin.conf (Production - сайт)

```nginx
# Замените YOUR_DOMAIN на ваш домен

# HTTP -> HTTPS redirect
server {
    listen 80;
    server_name YOUR_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl;
    http2 on;
    server_name YOUR_DOMAIN;

    ssl_certificate /etc/letsencrypt/live/YOUR_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR_DOMAIN/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_next/static {
        proxy_pass http://nextjs;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

### 8. nginx/nginx-ssl-init.conf (Временный для SSL)

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name _;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'SSL setup in progress...';
            add_header Content-Type text/plain;
        }
    }
}
```

### 9. scripts/init-ssl.sh

```bash
#!/bin/bash

# Скрипт получения SSL сертификата
# Usage: ./scripts/init-ssl.sh YOUR_DOMAIN

set -e

DOMAIN="${1:-example.com}"
EMAIL="${SSL_EMAIL:-admin@example.com}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔐 Setting up SSL certificate for: $DOMAIN"
echo "📧 Using email: $EMAIL"

cd "$PROJECT_DIR"

# Создаём директории
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Проверяем существующий сертификат
if [ -d "./certbot/conf/live/$DOMAIN" ]; then
    echo "⚠️  Certificate already exists for $DOMAIN"
    read -p "Renew? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Останавливаем контейнеры
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Запускаем временный nginx для ACME challenge
echo "🚀 Starting nginx for ACME challenge..."
docker run -d --rm \
    --name ssl_init_nginx \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx-ssl-init.conf:/etc/nginx/nginx.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

sleep 3

# Получаем сертификат
echo "📜 Requesting certificate..."
docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly --webroot \
    -w /var/www/certbot \
    -d $DOMAIN \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email

# Останавливаем временный nginx
docker stop ssl_init_nginx 2>/dev/null || true

# Проверяем результат
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ Failed to obtain certificate!"
    exit 1
fi

echo "✅ SSL certificate obtained!"

# Запускаем production
echo "🚀 Starting production..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "✅ Done! Site available at: https://$DOMAIN"
```

### 10. .env.dev.example

```env
# Development environment
NODE_ENV=development
NEXT_PUBLIC_API_URL=https://api.example.com
```

### 11. .env.prod.example

```env
# Production environment
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.example.com
```

---

## Первоначальная настройка сервера

### 1. Подключитесь к серверу

```bash
ssh user@your-server-ip
```

### 2. Установите Docker (если не установлен)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Установите Make (опционально)

```bash
sudo apt install make -y
```

### 4. Склонируйте проект

```bash
cd /opt  # или другая директория
git clone https://github.com/your-repo/your-project.git
cd your-project
```

### 5. Настройте DNS

В панели управления доменом создайте A-запись:
```
Тип: A
Имя: @ (или поддомен, например admin)
Значение: IP_вашего_сервера
TTL: 300
```

Проверьте:
```bash
dig your-domain.com +short
# Должен показать IP сервера
```

---

## Настройка проекта

### 1. Создайте файлы окружения

```bash
# Для dev
cp .env.dev.example .env.dev
nano .env.dev

# Для prod
cp .env.prod.example .env.prod
nano .env.prod
```

### 2. Отредактируйте nginx конфиг

В файле `nginx/conf.d/admin.conf` замените `YOUR_DOMAIN` на ваш домен:

```bash
sed -i 's/YOUR_DOMAIN/your-domain.com/g' nginx/conf.d/admin.conf
```

### 3. Отредактируйте init-ssl.sh

```bash
# Укажите email для SSL
export SSL_EMAIL=your-email@example.com
```

---

## Деплой Development

Development режим — HTTP без SSL, для тестирования.

```bash
# Способ 1: через Make
make dev-build

# Способ 2: напрямую
docker compose -f docker-compose.dev.yml up -d --build
```

Проверка:
```bash
# Статус контейнеров
docker compose -f docker-compose.dev.yml ps

# Логи
docker compose -f docker-compose.dev.yml logs -f

# Открыть в браузере
http://YOUR_SERVER_IP
```

Остановка:
```bash
docker compose -f docker-compose.dev.yml down
```

---

## Деплой Production

### Первый деплой (с получением SSL)

```bash
# Способ 1: через Make
make ssl-init

# Способ 2: вручную
chmod +x scripts/init-ssl.sh
./scripts/init-ssl.sh your-domain.com
```

Скрипт автоматически:
1. Создаст директории для certbot
2. Запустит временный nginx
3. Получит SSL сертификат от Let's Encrypt
4. Запустит production

### Последующие деплои

```bash
# Способ 1: через Make
make prod-build

# Способ 2: напрямую
docker compose -f docker-compose.prod.yml up -d --build
```

Проверка:
```bash
# Статус
docker compose -f docker-compose.prod.yml ps

# Логи
docker compose -f docker-compose.prod.yml logs -f

# Проверить SSL
curl -I https://your-domain.com
```

---

## Makefile команды

```bash
make help           # Показать все команды

# Development
make dev            # Запустить dev (без пересборки)
make dev-build      # Собрать и запустить dev

# Production
make prod           # Запустить prod (без пересборки)
make prod-build     # Собрать и запустить prod
make ssl-init       # Получить SSL сертификат
make ssl-renew      # Обновить SSL сертификат

# Общие
make down           # Остановить все контейнеры
make logs           # Показать логи
make ps             # Статус контейнеров
make clean          # Удалить контейнеры и образы

# Утилиты
make shell-app      # Зайти в контейнер приложения
make shell-nginx    # Зайти в контейнер nginx
make nginx-test     # Проверить конфиг nginx
make nginx-reload   # Перезагрузить nginx
```

---

## Обновление проекта

### Стандартное обновление

```bash
# 1. Получить изменения
git pull origin main

# 2. Пересобрать и перезапустить
docker compose -f docker-compose.prod.yml up -d --build

# или через Make
make prod-build
```

### Обновление без даунтайма

```bash
# 1. Собрать новый образ
docker compose -f docker-compose.prod.yml build app

# 2. Перезапустить только app
docker compose -f docker-compose.prod.yml up -d --no-deps app
```

### CI/CD автоматизация

Создайте `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/your-project
            git pull origin main
            docker compose -f docker-compose.prod.yml up -d --build
            docker image prune -f
```

---

## Troubleshooting

### Контейнер не запускается

```bash
# Проверить логи
docker compose -f docker-compose.prod.yml logs app

# Проверить статус
docker compose -f docker-compose.prod.yml ps

# Частые причины:
# - Нет .env файла
# - Ошибка в next.config.ts (нет output: "standalone")
# - Порт занят
```

### 502 Bad Gateway

```bash
# Проверить что app контейнер запущен
docker compose -f docker-compose.prod.yml ps

# Проверить логи nginx
docker compose -f docker-compose.prod.yml logs nginx

# Проверить логи app
docker compose -f docker-compose.prod.yml logs app

# Проверить сеть
docker network ls
```

### SSL сертификат не получается

```bash
# Проверить DNS
dig your-domain.com

# Проверить доступность порта 80
curl http://your-domain.com/.well-known/acme-challenge/test

# Проверить логи certbot
docker logs ssl_init_nginx
```

### Нет места на диске

```bash
# Проверить место
df -h

# Очистить Docker
docker system prune -a --volumes

# Удалить старые образы
docker image prune -a
```

### Порт уже занят

```bash
# Найти процесс
sudo lsof -i :80
sudo lsof -i :443

# Убить процесс
sudo kill -9 <PID>

# Или остановить конфликтующий сервис
sudo systemctl stop apache2
sudo systemctl stop nginx
```

### Изменения не применяются

```bash
# Пересобрать без кэша
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Очистить кэш браузера
# Ctrl+Shift+R или Cmd+Shift+R
```

---

## Полезные команды

```bash
# Зайти в контейнер
docker compose -f docker-compose.prod.yml exec app sh

# Посмотреть переменные окружения
docker compose -f docker-compose.prod.yml exec app env

# Проверить nginx конфиг
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Перезагрузить nginx
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

# Мониторинг ресурсов
docker stats

# Размер образов
docker images

# Очистка
docker system prune -a
```

---

## Чеклист деплоя

### Перед деплоем:
- [ ] Docker и Docker Compose установлены
- [ ] DNS записи настроены
- [ ] Проект склонирован
- [ ] `.env.prod` файл создан
- [ ] `nginx/conf.d/admin.conf` отредактирован (домен)
- [ ] `next.config.ts` содержит `output: "standalone"`

### Production деплой:
- [ ] SSL сертификат получен (`make ssl-init`)
- [ ] Контейнеры запущены (`docker compose ps`)
- [ ] Сайт открывается по HTTPS
- [ ] Редирект HTTP→HTTPS работает
- [ ] Healthcheck проходит

### После деплоя:
- [ ] Логи не содержат ошибок
- [ ] Основной функционал работает
- [ ] API подключается

