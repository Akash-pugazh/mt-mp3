#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/.pids/cloudflared.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Tunnel is not running"
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" >/dev/null 2>&1; then
  kill "$PID"
  echo "Stopped tunnel PID $PID"
else
  echo "Tunnel PID file existed but process was not running"
fi

rm -f "$PID_FILE"
