#!/bin/bash

# SSL Certificate Setup Script for admin.parmenid.tech
# Usage: ./scripts/init-ssl.sh [domain]
# Example: ./scripts/init-ssl.sh admin.parmenid.tech

set -e

DOMAIN="${1:-admin.parmenid.tech}"
EMAIL="${SSL_EMAIL:-admin@parmenid.tech}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔐 Setting up SSL certificate for: $DOMAIN"
echo "📧 Using email: $EMAIL"
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Create directories
echo "📂 Creating certbot directories..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www

# Check if certificate already exists
if [ -d "./certbot/conf/live/$DOMAIN" ]; then
    echo "⚠️  Certificate already exists for $DOMAIN"
    read -p "Do you want to renew it? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Aborted."
        exit 1
    fi
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true

# Start nginx with minimal SSL-init config (no app dependency)
echo "🚀 Starting nginx for ACME challenge..."
docker run -d --rm \
    --name parmenid_nginx_ssl_init \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx-ssl-init.conf:/etc/nginx/nginx.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

# Wait for nginx to start
echo "⏳ Waiting for nginx to start..."
sleep 3

# Check if nginx is running
if ! docker ps | grep -q "parmenid_nginx_ssl_init"; then
    echo "❌ Nginx failed to start. Check logs:"
    docker logs parmenid_nginx_ssl_init 2>/dev/null || echo "Container not found"
    exit 1
fi

# Verify ACME challenge endpoint is accessible
echo "🔍 Verifying ACME challenge endpoint..."
ACME_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ 2>/dev/null || echo "000")
echo "   HTTP status: $ACME_TEST (200 expected)"

if [ "$ACME_TEST" != "200" ]; then
    echo "⚠️  Warning: nginx may not be responding correctly"
    docker logs parmenid_nginx_ssl_init --tail=10
fi

# Get certificate
echo "📜 Requesting certificate from Let's Encrypt..."

CERTBOT_CMD="certonly --webroot -w /var/www/certbot -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email"

if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "🔄 Renewing existing certificate..."
    CERTBOT_CMD="$CERTBOT_CMD --force-renewal"
else
    echo "🆕 Creating new certificate..."
fi

docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot $CERTBOT_CMD

# Stop SSL init nginx
echo "🛑 Stopping SSL init nginx..."
docker stop parmenid_nginx_ssl_init 2>/dev/null || true

# Check if certificate was obtained
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ Failed to obtain certificate!"
    echo "Check logs above for details."
    exit 1
fi

echo "✅ SSL certificate obtained successfully!"

# Start all services with proper config
echo "🚀 Starting services with SSL..."
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "✅ Done! Your site should now be available at:"
echo "   https://$DOMAIN"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "   Restart:       docker compose -f docker-compose.prod.yml restart"
echo "   Renew cert:    docker compose -f docker-compose.prod.yml run --rm certbot renew"

