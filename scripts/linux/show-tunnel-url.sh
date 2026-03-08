#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$PROJECT_ROOT"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not on PATH." >&2
  exit 1
fi

URL="$(docker compose logs tunnel --no-color 2>&1 | grep -Eo 'https://[-0-9a-z]+\.trycloudflare\.com' | tail -n 1 || true)"

if [ -z "$URL" ]; then
  echo "Tunnel URL not found in docker compose logs. Run docker compose up -d first, then retry." >&2
  exit 1
fi

echo "$URL"
