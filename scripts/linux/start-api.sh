#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"
ENV_EXAMPLE="$PROJECT_ROOT/.env.local.example"
PID_DIR="$PROJECT_ROOT/.pids"
LOG_DIR="$PROJECT_ROOT/logs"
PID_FILE="$PID_DIR/api.pid"
LOG_FILE="$LOG_DIR/api.log"

mkdir -p "$PID_DIR" "$LOG_DIR"

if [ ! -f "$ENV_FILE" ]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "Created .env.local from template"
fi

cd "$PROJECT_ROOT"
npm install
npm run build

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  echo "API already running with PID $(cat "$PID_FILE")"
  exit 0
fi

nohup bash -lc 'set -a; source ./.env.local; set +a; npm start' >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"
sleep 2

if ! kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  echo "API failed to start. Check $LOG_FILE" >&2
  exit 1
fi

echo "API started with PID $(cat "$PID_FILE")"
echo "Log: $LOG_FILE"
