#!/usr/bin/env bash
# Guard against reintroducing the legacy { success, data } HTTP envelope
# in Nest controllers and Python helpers (AIP REST cutover).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

failed=0

if rg -n 'success:\s*true' services/server/src --glob '*controller*.ts' >/tmp/aip-rest-hits.txt; then
  echo "AIP REST check failed: legacy success:true envelope in controllers:" >&2
  cat /tmp/aip-rest-hits.txt >&2
  failed=1
fi

if rg -n '["'\'']success["'\'']\s*:\s*(False|false|True|true)' \
  services/recommendation services/vision services/rag services/media-gen \
  --glob '*.py' >/tmp/aip-rest-py-hits.txt; then
  echo "AIP REST check failed: legacy success envelope in Python helpers:" >&2
  cat /tmp/aip-rest-py-hits.txt >&2
  failed=1
fi

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

echo "AIP REST check passed (no legacy success envelopes)."
