# Frontend Deployment Makefile
# Server: 83.217.221.77
# Domain: admin.parmenid.tech

.PHONY: help dev prod down logs build deploy ssl-init ssl-renew clean ps

# Default target
help:
	@echo ""
	@echo "📦 Frontend Deployment Commands"
	@echo "================================"
	@echo ""
	@echo "Development (HTTP):"
	@echo "  make dev          - Start dev server (HTTP only, port 80)"
	@echo "  make dev-build    - Rebuild and start dev server"
	@echo ""
	@echo "Production (HTTPS):"
	@echo "  make prod         - Start production server (HTTPS)"
	@echo "  make prod-build   - Rebuild and start production"
	@echo "  make ssl-init     - Get SSL certificate from Let's Encrypt"
	@echo "  make ssl-renew    - Renew SSL certificate"
	@echo ""
	@echo "Common:"
	@echo "  make down         - Stop all containers"
	@echo "  make logs         - Show logs (follow mode)"
	@echo "  make ps           - Show running containers"
	@echo "  make clean        - Remove containers, images, volumes"
	@echo ""
	@echo "Quick Deploy:"
	@echo "  make deploy-dev   - Full dev deployment (build + start)"
	@echo "  make deploy-prod  - Full prod deployment (ssl + build + start)"
	@echo ""

# ============== Development ==============

dev:
	@echo "🚀 Starting dev server (HTTP)..."
	docker compose -f docker-compose.dev.yml up -d

dev-build:
	@echo "🔨 Building and starting dev server..."
	docker compose -f docker-compose.dev.yml up -d --build

deploy-dev: env-dev dev-build
	@echo "✅ Dev deployment complete!"
	@echo "   Access: http://83.217.221.77"

# ============== Production ==============

prod:
	@echo "🚀 Starting production server (HTTPS)..."
	docker compose -f docker-compose.prod.yml up -d

prod-build:
	@echo "🔨 Building and starting production server..."
	docker compose -f docker-compose.prod.yml up -d --build

deploy-prod: env-prod ssl-check prod-build
	@echo "✅ Production deployment complete!"
	@echo "   Access: https://admin.parmenid.tech"

# ============== SSL ==============

ssl-init:
	@echo "🔐 Initializing SSL certificate..."
	chmod +x scripts/init-ssl.sh
	./scripts/init-ssl.sh admin.parmenid.tech

ssl-renew:
	@echo "🔄 Renewing SSL certificate..."
	docker compose -f docker-compose.prod.yml run --rm certbot renew
	docker compose -f docker-compose.prod.yml restart nginx

ssl-check:
	@if [ ! -f "certbot/conf/live/admin.parmenid.tech/fullchain.pem" ]; then \
		echo "⚠️  SSL certificate not found. Run 'make ssl-init' first."; \
		exit 1; \
	fi

# ============== Common ==============

down:
	@echo "⏹️  Stopping containers..."
	-docker compose -f docker-compose.dev.yml down 2>/dev/null
	-docker compose -f docker-compose.prod.yml down 2>/dev/null

logs:
	@if [ -f "docker-compose.prod.yml" ] && docker compose -f docker-compose.prod.yml ps -q 2>/dev/null | grep -q .; then \
		docker compose -f docker-compose.prod.yml logs -f; \
	else \
		docker compose -f docker-compose.dev.yml logs -f; \
	fi

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f

logs-prod:
	docker compose -f docker-compose.prod.yml logs -f

ps:
	@echo "📋 Dev containers:"
	@docker compose -f docker-compose.dev.yml ps 2>/dev/null || echo "   (none running)"
	@echo ""
	@echo "📋 Prod containers:"
	@docker compose -f docker-compose.prod.yml ps 2>/dev/null || echo "   (none running)"

clean:
	@echo "🧹 Cleaning up..."
	-docker compose -f docker-compose.dev.yml down -v --rmi local 2>/dev/null
	-docker compose -f docker-compose.prod.yml down -v --rmi local 2>/dev/null
	@echo "✅ Cleanup complete"

# ============== Environment Setup ==============

env-dev:
	@if [ ! -f ".env.dev" ]; then \
		echo "📝 Creating .env.dev from example..."; \
		cp .env.dev.example .env.dev; \
	fi

env-prod:
	@if [ ! -f ".env.prod" ]; then \
		echo "📝 Creating .env.prod from example..."; \
		cp .env.prod.example .env.prod; \
	fi

# ============== Utility ==============

shell-app:
	docker compose -f docker-compose.prod.yml exec app sh

shell-nginx:
	docker compose -f docker-compose.prod.yml exec nginx sh

nginx-test:
	docker compose -f docker-compose.prod.yml exec nginx nginx -t

nginx-reload:
	docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

