#!/usr/bin/env bash
set -euo pipefail

LOCAL_URL="${1:-http://127.0.0.1:3000}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
CLOUDFLARED_BIN="$PROJECT_ROOT/.tools/cloudflared/cloudflared"
PID_DIR="$PROJECT_ROOT/.pids"
LOG_DIR="$PROJECT_ROOT/logs"
PID_FILE="$PID_DIR/cloudflared.pid"
LOG_FILE="$LOG_DIR/cloudflared.log"

mkdir -p "$PID_DIR" "$LOG_DIR"

if [ ! -x "$CLOUDFLARED_BIN" ]; then
  "$SCRIPT_DIR/setup-machine.sh"
fi

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  echo "Tunnel already running with PID $(cat "$PID_FILE")"
  grep -Eo 'https://[-0-9a-z]+\.trycloudflare\.com' "$LOG_FILE" | tail -n 1 || true
  exit 0
fi

: >"$LOG_FILE"
nohup "$CLOUDFLARED_BIN" tunnel --url "$LOCAL_URL" --no-autoupdate >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

for _ in $(seq 1 30); do
  if grep -Eq 'https://[-0-9a-z]+\.trycloudflare\.com' "$LOG_FILE"; then
    break
  fi
  sleep 1
done

if ! kill -0 "$(cat "$PID_FILE")" >/dev/null 2>&1; then
  echo "Tunnel failed to start. Check $LOG_FILE" >&2
  exit 1
fi

URL="$(grep -Eo 'https://[-0-9a-z]+\.trycloudflare\.com' "$LOG_FILE" | tail -n 1 || true)"
if [ -n "$URL" ]; then
  echo "Tunnel URL: $URL"
else
  echo "Tunnel started but URL not detected yet. Check $LOG_FILE"
fi
