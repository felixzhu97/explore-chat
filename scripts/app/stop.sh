#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENV=${1:-dev}
REMOVE_VOLUMES=false
[[ "$1" == "--remove-volumes" || "$2" == "--remove-volumes" ]] && REMOVE_VOLUMES=true
[[ "$1" == "--remove-volumes" ]] && ENV=${2:-dev}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/services/server"

echo -e "${GREEN}Stopping WhatsChat (${ENV})${NC}\n"

echo "[1/2] Stopping processes..."
lsof -ti:9200 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8100 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8110 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8120 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3456 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "services/media-gen/main.py" 2>/dev/null || true
pkill -f "services/video-gen/app.py" 2>/dev/null || true
pkill -f "services/image-gen/app.py" 2>/dev/null || true
pkill -f "services/voice-gen/app.py" 2>/dev/null || true
pkill -f "celery.*celery_app" 2>/dev/null || true
SERVER_PIDS=$(ps aux | grep -E "(nest start|node.*dist/main.js|pnpm.*dev)" | grep -v grep | awk '{print $2}' || true)
for PID in $SERVER_PIDS; do kill $PID 2>/dev/null || true; done
sleep 1
for PID in $SERVER_PIDS; do kill -9 $PID 2>/dev/null || true; done

echo "[2/2] Docker down..."
COMPOSE_CMD="docker compose"
docker compose version >/dev/null 2>&1 || COMPOSE_CMD="docker-compose"
cd "$SERVER_DIR"
export COMPOSE_PROJECT_NAME=whatschat
[ "$REMOVE_VOLUMES" = "true" ] && $COMPOSE_CMD -f docker-compose.yml down -v || $COMPOSE_CMD -f docker-compose.yml down
cd "$ROOT_DIR"

echo -e "\n${GREEN}Stopped. Run: pnpm start${NC}\n"
