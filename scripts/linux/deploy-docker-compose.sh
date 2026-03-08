#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

"$SCRIPT_DIR/setup-machine.sh"

cd "$PROJECT_ROOT"

if [ ! -f ".env.local" ]; then
  cp ".env.local.example" ".env.local"
fi

docker compose up -d --build

echo
echo "API health: http://127.0.0.1:3000/api/v1/health"
echo "Tunnel URL:"
"$SCRIPT_DIR/show-tunnel-url.sh"
