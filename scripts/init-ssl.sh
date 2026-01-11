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

# Create temporary nginx config for ACME challenge
echo "🔧 Creating temporary nginx config for ACME challenge..."
cat > ./nginx/conf.d/temp-acme.conf << 'NGINX_CONF'
server {
    listen 80;
    server_name admin.parmenid.tech;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
NGINX_CONF

# Replace domain in temp config
sed -i.bak "s/admin.parmenid.tech/$DOMAIN/g" ./nginx/conf.d/temp-acme.conf
rm -f ./nginx/conf.d/temp-acme.conf.bak

# Temporarily disable the main admin.conf
if [ -f "./nginx/conf.d/admin.conf" ]; then
    mv ./nginx/conf.d/admin.conf ./nginx/conf.d/admin.conf.disabled
fi

# Start nginx for ACME challenge
echo "🚀 Starting nginx for ACME challenge..."
docker compose -f docker-compose.prod.yml up -d nginx

# Wait for nginx to start
echo "⏳ Waiting for nginx to start..."
sleep 5

# Check if nginx is running
if ! docker compose -f docker-compose.prod.yml ps nginx | grep -q "Up"; then
    echo "❌ Nginx failed to start. Check logs:"
    docker compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

# Get certificate
echo "📜 Requesting certificate from Let's Encrypt..."
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal

# Check if certificate was obtained
if [ ! -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    echo "❌ Failed to obtain certificate!"
    exit 1
fi

echo "✅ SSL certificate obtained successfully!"

# Remove temporary config and restore admin.conf
echo "🔧 Restoring nginx configuration..."
rm -f ./nginx/conf.d/temp-acme.conf
if [ -f "./nginx/conf.d/admin.conf.disabled" ]; then
    mv ./nginx/conf.d/admin.conf.disabled ./nginx/conf.d/admin.conf
fi

# Restart all services with proper config
echo "🔄 Restarting services with SSL..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

echo ""
echo "✅ Done! Your site should now be available at:"
echo "   https://$DOMAIN"
echo ""
echo "📋 Useful commands:"
echo "   View logs:     docker compose -f docker-compose.prod.yml logs -f"
echo "   Restart:       docker compose -f docker-compose.prod.yml restart"
echo "   Renew cert:    docker compose -f docker-compose.prod.yml run --rm certbot renew"

