#!/usr/bin/env bash
# Stop local Web/API (and optional Python side services). No Docker.
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${GREEN}Stopping ExploreChat${NC}"

lsof -ti:3001 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:4000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3456 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "services/media-gen/main.py" 2>/dev/null || true
pkill -f "celery.*celery_app" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null || true
SERVER_PIDS=$(ps aux | grep -E "(nest start|node.*dist/main.js|turbo run dev|whatschat-web|whatschat-server)" | grep -v grep | awk '{print $2}' || true)
for PID in $SERVER_PIDS; do kill $PID 2>/dev/null || true; done
sleep 1
for PID in $SERVER_PIDS; do kill -9 $PID 2>/dev/null || true; done

if [[ "${1:-}" == "--remove-db" ]]; then
  rm -f "$ROOT_DIR/services/server/prisma/dev.db" \
        "$ROOT_DIR/services/server/prisma/dev.db-journal" \
        "$ROOT_DIR/services/server/dev.db"
  echo "Removed local SQLite files"
fi

echo -e "${GREEN}Done${NC}"
