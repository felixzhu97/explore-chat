#!/usr/bin/env bash
# Local boot: Java API + Web (Nest removed).
set -euo pipefail

ENV=${1:-dev}
[[ "$ENV" == "dev" || "$ENV" == "prod" ]] || { echo "Usage: $0 [dev|prod]"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

echo "Chat ($ENV) — Spring Boot + Next.js"

if [[ "$ENV" == "prod" ]]; then
  export NODE_ENV=production
  ./gradlew bootJar --quiet
  exec java -jar build/libs/explore-chat-*.jar
fi

pnpm --filter @chat/analytics build

# Start Java API in background
./gradlew bootRun --quiet &
JAVA_PID=$!
trap 'kill "$JAVA_PID" 2>/dev/null || true' EXIT

# Wait for health
for _ in $(seq 1 60); do
  if curl -sf "http://localhost:9001/api/v1/health" >/dev/null 2>&1 \
    || curl -sf "http://localhost:9001/actuator/health" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "Web http://localhost:4000  ·  API http://localhost:9001  ·  Socket.IO http://localhost:9002"
exec pnpm exec turbo run dev --filter=chat-web --concurrency=23
