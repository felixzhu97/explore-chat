#!/usr/bin/env bash
# Guard against reintroducing the legacy { success, data } HTTP envelope
# in Python helpers (AIP REST cutover). Nest server removed.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

failed=0

if rg -n '["'\'']success["'\'']\s*:\s*(False|false|True|true)' \
  src/main/ml/recommendation src/main/ml/vision src/main/ml/rag src/main/ml/media-gen \
  --glob '*.py' >/tmp/aip-rest-py-hits.txt; then
  echo "AIP REST check failed: legacy success envelope in Python helpers:" >&2
  cat /tmp/aip-rest-py-hits.txt >&2
  failed=1
fi

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

echo "AIP REST check passed (no legacy success envelopes)."
