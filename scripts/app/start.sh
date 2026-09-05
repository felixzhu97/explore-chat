#!/usr/bin/env bash
# Local boot (docker-free): .env → migrate → packages → Web + API.
set -euo pipefail

ENV=${1:-dev}
[[ "$ENV" == "dev" || "$ENV" == "prod" ]] || { echo "Usage: $0 [dev|prod]"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SERVER_DIR="$ROOT_DIR/services/server"

echo "ExploreChat ($ENV) — Node + SQLite (no Docker)"

# .env
if [ ! -f "$SERVER_DIR/.env" ]; then
  cp "$SERVER_DIR/.env.example" "$SERVER_DIR/.env"
  echo "Created services/server/.env"
fi

cd "$ROOT_DIR"

# DB + shared types
pnpm --filter whatschat-server db:generate
pnpm --filter whatschat-server migrate:deploy
pnpm --filter @whatschat/shared-types build

if [[ "$ENV" == "prod" ]]; then
  export NODE_ENV=production
  pnpm --filter whatschat-server build
  exec pnpm --filter whatschat-server start
fi

echo "Web http://localhost:4000  ·  API http://localhost:3001"
exec pnpm exec turbo run dev \
  --filter=whatschat-web \
  --filter=whatschat-server \
  --concurrency=23
