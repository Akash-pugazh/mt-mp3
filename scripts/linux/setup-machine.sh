#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TOOLS_DIR="$PROJECT_ROOT/.tools"
CLOUDFLARED_DIR="$TOOLS_DIR/cloudflared"
CLOUDFLARED_BIN="$CLOUDFLARED_DIR/cloudflared"

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required on Linux Mint." >&2
  exit 1
fi

sudo apt-get update
sudo apt-get install -y curl ca-certificates gnupg lsb-release xz-utils

if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v22\.'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

mkdir -p "$CLOUDFLARED_DIR"
if [ ! -x "$CLOUDFLARED_BIN" ]; then
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o "$CLOUDFLARED_BIN"
  chmod +x "$CLOUDFLARED_BIN"
fi

echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "cloudflared: $CLOUDFLARED_BIN"
