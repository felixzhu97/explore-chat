#!/usr/bin/env bash
# Stop local Web/API (and optional Python side services). No Docker.
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${GREEN}Stopping Chat${NC}"

lsof -ti:9001 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:9002 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:4000 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3456 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "celery.*celery_app" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "ChatApplication\|ChatSpringApplication\|bootRun\|chat-web\|turbo run dev" 2>/dev/null || true
SERVER_PIDS=$(ps aux | grep -E "(gradle.*bootRun|ChatSpringApplication|turbo run dev|chat-web)" | grep -v grep | awk '{print $2}' || true)
for PID in $SERVER_PIDS; do kill $PID 2>/dev/null || true; done
sleep 1
for PID in $SERVER_PIDS; do kill -9 $PID 2>/dev/null || true; done

if [[ "${1:-}" == "--remove-db" ]]; then
  rm -rf "$ROOT_DIR/data"
  echo "Removed local H2 data directory"
fi

echo -e "${GREEN}Done${NC}"
