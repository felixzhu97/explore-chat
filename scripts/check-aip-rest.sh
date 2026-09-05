#!/usr/bin/env bash
# Guard against reintroducing the legacy { success, data } HTTP envelope
# in Nest controllers (AIP REST cutover).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if rg -n 'success:\s*true' services/server/src --glob '*controller*.ts' >/tmp/aip-rest-hits.txt; then
  echo "AIP REST check failed: legacy success:true envelope in controllers:" >&2
  cat /tmp/aip-rest-hits.txt >&2
  exit 1
fi

echo "AIP REST check passed (no success:true in controllers)."
