#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
[ -d "$ROOT_DIR/node_modules" ] || (cd "$ROOT_DIR" && pnpm install)
exec "$SCRIPT_DIR/../app/start.sh" dev
