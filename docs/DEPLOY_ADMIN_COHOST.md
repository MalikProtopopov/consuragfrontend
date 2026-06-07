# Деплой админ-фронта (со-хостинг на бэкенд-сервере)

> Развёрнуто 2026-06-07. Фронт (`admin.parmenid.tech`) **со-хостится** на сервере бэкенда
> `95.140.159.9` (рядом с `api.parmenid.tech`), т.к. отдельный сервер (DNS-таргет 83.217.221.77)
> недоступен.

## Что сделано (на сервере 95.140.159.9)

1. **Образ фронта** собран локально под `linux/amd64` (build-arg `NEXT_PUBLIC_API_URL=https://api.parmenid.tech`),
   перенесён на сервер (`docker save | ssh | docker load`) → образ `parmenid-admin:latest`.
2. **Контейнер** `parmenid_admin_app` запущен на сети бэкенда `avatar_network_prod`
   (`--restart unless-stopped`, внутренний порт `3000`, без публикации портов на хост).
3. **nginx бэкенда** (`avatar_nginx_prod`, конфиг `/opt/consulrag/nginx/nginx.conf`): добавлен
   `server`-блок для `admin.parmenid.tech` (:80), проксирующий на `http://parmenid_admin_app:3000`,
   с `location /.well-known/acme-challenge/` для будущего SSL. Бэкап оригинала — рядом
   (`nginx.conf.bak.*`). api-блок не тронут — `api.parmenid.tech` работает (`/health → 200`).

Проверено: `curl -H "Host: admin.parmenid.tech" http://localhost/login` → 200, `<title>Вход | Avatar AI</title>`.

## ⚠️ Что нужно сделать пользователю (вне моего доступа)

1. **DNS:** перевести A-запись `admin.parmenid.tech` с `83.217.221.77` → **`95.140.159.9`**.
   До этого домен публично недоступен (сейчас отдаётся только при `Host: admin.parmenid.tech` к этому серверу).
2. **SSL (после смены DNS):** получить сертификат Let's Encrypt и добавить :443-блок:
   ```bash
   cd /opt/consulrag
   docker compose --env-file .env.prod -f docker-compose.prod.yml run --rm certbot \
     certonly --webroot -w /var/www/certbot -d admin.parmenid.tech
   # затем добавить в nginx.conf :443 server-блок для admin.parmenid.tech
   # (по образцу api-блока: ssl_certificate /etc/letsencrypt/live/admin.parmenid.tech/...),
   # в :80-блоке заменить location / на: return 301 https://$host$request_uri;
   # и перезапустить: docker restart avatar_nginx_prod
   ```

## Обновление фронта в будущем

```bash
# локально (репозиторий фронта):
docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL=https://api.parmenid.tech \
  -t parmenid-admin:latest --load .
docker save parmenid-admin:latest | gzip | \
  ssh root@95.140.159.9 'gunzip | docker load'
# на сервере:
ssh root@95.140.159.9 'docker rm -f parmenid_admin_app && \
  docker run -d --name parmenid_admin_app --restart unless-stopped \
  --network avatar_network_prod parmenid-admin:latest'
```

## Подводный камень nginx-конфига

`nginx.conf` примонтирован в контейнер как **отдельный файл** (`:ro`). При замене через `mv`
(новый inode) контейнер продолжает видеть старый файл → `nginx -s reload` не подхватывает правки.
Решение: после правки конфига — `docker restart avatar_nginx_prod` (перечитывает текущий файл),
либо редактировать **in-place** (`cp`/`sed -i`, тот же inode) и тогда `reload` сработает.
