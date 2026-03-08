#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

"$SCRIPT_DIR/setup-machine.sh"
"$SCRIPT_DIR/start-api.sh"

sleep 2
HEALTH_URL="http://127.0.0.1:3000/api/v1/health"
if ! curl -fsS "$HEALTH_URL" >/dev/null; then
  echo "API health check failed at $HEALTH_URL" >&2
  exit 1
fi

"$SCRIPT_DIR/start-tunnel.sh" "http://127.0.0.1:3000"

echo
echo "API local health: $HEALTH_URL"
echo "API log: $PROJECT_ROOT/logs/api.log"
echo "Tunnel log: $PROJECT_ROOT/logs/cloudflared.log"
