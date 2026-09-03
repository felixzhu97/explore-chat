#!/bin/bash
set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENV=${1:-dev}
[[ "$ENV" == "dev" || "$ENV" == "prod" ]] || { echo -e "${RED}$0 [dev|prod]${NC}"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/services/server"
MEDIA_GEN_DIR="$ROOT_DIR/services/media-gen"
RECOMMENDATION_DIR="$ROOT_DIR/services/recommendation"
VISION_DIR="$ROOT_DIR/services/vision"
RAG_DIR="$ROOT_DIR/services/rag"
SERVER_PID=""
MEDIA_GEN_PID=""
VISION_PID=""
RECOMMENDATION_PID=""
RECOMMENDATION_API_PID=""
RAG_PID=""

cleanup() {
  [ -n "$SERVER_PID" ] && kill $SERVER_PID 2>/dev/null || true
  [ -n "$MEDIA_GEN_PID" ] && kill $MEDIA_GEN_PID 2>/dev/null || true
  [ -n "$VISION_PID" ] && kill $VISION_PID 2>/dev/null || true
  [ -n "$RECOMMENDATION_PID" ] && kill $RECOMMENDATION_PID 2>/dev/null || true
  [ -n "$RECOMMENDATION_API_PID" ] && kill $RECOMMENDATION_API_PID 2>/dev/null || true
  [ -n "$RAG_PID" ] && kill $RAG_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}WhatsChat (${ENV})${NC}\n"

echo "[1/6] Stopping old processes..."
lsof -ti:9200 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:3456 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8100 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8110 2>/dev/null | xargs kill -9 2>/dev/null || true
lsof -ti:8120 2>/dev/null | xargs kill -9 2>/dev/null || true
pkill -f "whatschat-server.*dev" 2>/dev/null || true
pkill -f "services/media-gen/main.py" 2>/dev/null || true
pkill -f "services/video-gen/app.py" 2>/dev/null || true
pkill -f "services/image-gen/app.py" 2>/dev/null || true
pkill -f "services/voice-gen/app.py" 2>/dev/null || true
pkill -f "celery.*celery_app" 2>/dev/null || true
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "services/recommendation/run_service.py" 2>/dev/null || true
sleep 1

echo "[2/6] Docker + env..."
COMPOSE_CMD="docker compose"
docker compose version >/dev/null 2>&1 || COMPOSE_CMD="docker-compose"
cd "$SERVER_DIR"
export COMPOSE_PROJECT_NAME=whatschat
$COMPOSE_CMD -f docker-compose.yml down 2>/dev/null || true
$COMPOSE_CMD -f docker-compose.yml up -d --wait postgres redis kafka cassandra mongodb elasticsearch qdrant 2>/dev/null || true
for i in $(seq 1 60); do
  nc -z 127.0.0.1 5433 2>/dev/null && nc -z 127.0.0.1 6379 2>/dev/null && nc -z 127.0.0.1 9092 2>/dev/null && \
  nc -z 127.0.0.1 9042 2>/dev/null && nc -z 127.0.0.1 27017 2>/dev/null && nc -z 127.0.0.1 9520 2>/dev/null && \
  nc -z 127.0.0.1 6333 2>/dev/null && break
  sleep 1
done
sleep 2
export DATABASE_URL="${DATABASE_URL:-postgresql://whatschat:whatschat123@localhost:5433/whatschat?schema=public}"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"
export KAFKA_BROKERS="${KAFKA_BROKERS:-localhost:9092}"
export JWT_SECRET="${JWT_SECRET:-whatschat-dev-jwt-secret}"
export JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET:-whatschat-dev-refresh-secret}"
export CASSANDRA_CONTACT_POINTS="${CASSANDRA_CONTACT_POINTS:-127.0.0.1:9042}"
export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/whatschat}"
export ELASTICSEARCH_NODE="${ELASTICSEARCH_NODE:-http://localhost:9520}"
export NODE_ENV=$([ "$ENV" == "prod" ] && echo production || echo development)
cd "$ROOT_DIR"

echo "[3/6] Migrate + seed..."
pnpm --filter whatschat-server migrate >/dev/null 2>&1 || true
[ "$ENV" == "dev" ] && "$SCRIPT_DIR/../db/seed.sh" dev >/dev/null 2>&1 || true

echo "[4/6] Sync users to Elasticsearch..."
(cd "$SERVER_DIR" && pnpm run search:sync-users 2>/dev/null) || true

echo "[5/6] Starting server..."
if [ -f "$MEDIA_GEN_DIR/main.py" ] && command -v python3 >/dev/null 2>&1; then
  if [ -f "$MEDIA_GEN_DIR/requirements.txt" ]; then
    (cd "$MEDIA_GEN_DIR" && python3 -m pip install -r requirements.txt -q 2>/dev/null) || true
  fi
  (cd "$MEDIA_GEN_DIR" && ( [ -d ".venv" ] && . .venv/bin/activate; python3 main.py )) &
  MEDIA_GEN_PID=$!
  sleep 2
fi
if [ -d "$VISION_DIR" ] && [ -f "$VISION_DIR/requirements.txt" ] && command -v python3 >/dev/null 2>&1; then
  (cd "$VISION_DIR" && {
    [ ! -d ".venv" ] && python3 -m venv .venv
    .venv/bin/pip install -r requirements.txt -q 2>/dev/null || true
    exec .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8110
  }) &
  VISION_PID=$!
  sleep 2
  kill -0 $VISION_PID 2>/dev/null && echo -e "${GREEN}Vision service started on http://localhost:8110${NC}" || VISION_PID=""
fi

echo "[5.5/6] Starting RAG service..."
if [ -d "$RAG_DIR" ] && [ -f "$RAG_DIR/requirements.txt" ] && command -v python3 >/dev/null 2>&1; then
  (cd "$RAG_DIR" && {
    if [ ! -d ".venv" ]; then
      python3 -m venv .venv
    fi
    .venv/bin/pip install -r requirements.txt -q 2>/dev/null || true
  }) &
  (cd "$RAG_DIR" && .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8120) &
  RAG_PID=$!
  sleep 2
  kill -0 $RAG_PID 2>/dev/null && echo -e "${GREEN}RAG service started on http://localhost:8120${NC}" || RAG_PID=""
fi

[ ! -d "$ROOT_DIR/node_modules" ] && pnpm install
cd "$ROOT_DIR"
pnpm --filter whatschat-server dev &
SERVER_PID=$!
sleep 2
kill -0 $SERVER_PID 2>/dev/null || { echo -e "${RED}Server failed${NC}"; exit 1; }

for i in $(seq 1 90); do
  kill -0 $SERVER_PID 2>/dev/null || { echo -e "${RED}Server exited${NC}"; exit 1; }
  nc -z 127.0.0.1 9200 2>/dev/null && break
  [ $i -eq 90 ] && { kill $SERVER_PID 2>/dev/null; echo -e "${RED}Server listen timeout${NC}"; exit 1; }
  sleep 3
done

echo "[6/6] Recommendation (optional)..."
if [ -d "$RECOMMENDATION_DIR" ] && command -v python3 >/dev/null 2>&1; then
  if [ -d "$RECOMMENDATION_DIR/.venv" ]; then
    (cd "$RECOMMENDATION_DIR" && . .venv/bin/activate && pip install -r requirements.txt -q 2>/dev/null) || true
  else
    (cd "$RECOMMENDATION_DIR" && python3 -m pip install -r requirements.txt -q 2>/dev/null) || true
  fi
  if [ -f "$RECOMMENDATION_DIR/celery_app.py" ]; then
    if [ -d "$RECOMMENDATION_DIR/.venv" ]; then
      (cd "$RECOMMENDATION_DIR" && . .venv/bin/activate && celery -A celery_app worker -l info -B 2>/dev/null) &
    elif command -v celery >/dev/null 2>&1; then
      (cd "$RECOMMENDATION_DIR" && celery -A celery_app worker -l info -B 2>/dev/null) &
    else
      (cd "$RECOMMENDATION_DIR" && python3 -m celery -A celery_app worker -l info -B 2>/dev/null) &
    fi
    RECOMMENDATION_PID=$!
    sleep 1
    kill -0 $RECOMMENDATION_PID 2>/dev/null && echo -e "${GREEN}Recommendation worker+beat started${NC}" || RECOMMENDATION_PID=""
  fi
  if [ -f "$RECOMMENDATION_DIR/main.py" ]; then
    if [ -d "$RECOMMENDATION_DIR/.venv" ]; then
      (cd "$RECOMMENDATION_DIR" && . .venv/bin/activate && python3 -m uvicorn main:app --host 0.0.0.0 --port 8100) &
    else
      (cd "$RECOMMENDATION_DIR" && python3 -m uvicorn main:app --host 0.0.0.0 --port 8100) &
    fi
    RECOMMENDATION_API_PID=$!
    sleep 1
    kill -0 $RECOMMENDATION_API_PID 2>/dev/null && echo -e "${GREEN}Recommendation API started on http://localhost:8100${NC}" || RECOMMENDATION_API_PID=""
  fi
fi

echo -e "\n${GREEN}Ready. API: http://localhost:9200  Vision: http://localhost:8110  RAG: http://localhost:8120  (Ctrl+C to stop)${NC}\n"
wait $SERVER_PID
