#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-5500}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "ADN local server running"
echo "Public site: http://127.0.0.1:${PORT}/"
echo "Admin panel: http://127.0.0.1:${PORT}/admin/"

python scripts/serve.py --port "$PORT" --no-browser
