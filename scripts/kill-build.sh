#!/bin/bash
# Emergency script to kill stuck Docker builds

echo "🛑 Stopping all Docker containers..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.dev.yml down 2>/dev/null || true

echo "🔪 Killing all Docker build processes..."
pkill -f "docker.*build" || true
pkill -f "docker-compose.*build" || true

echo "🧹 Cleaning up Docker build cache..."
docker builder prune -f

echo "📊 Checking Docker processes..."
docker ps -a

echo "✅ Cleanup complete. You can now try building again."

