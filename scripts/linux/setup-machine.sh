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

if ! command -v docker >/dev/null 2>&1; then
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER" || true
fi

mkdir -p "$CLOUDFLARED_DIR"
if [ ! -x "$CLOUDFLARED_BIN" ]; then
  curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
    -o "$CLOUDFLARED_BIN"
  chmod +x "$CLOUDFLARED_BIN"
fi

echo "Node: $(node -v)"
echo "npm: $(npm -v)"
echo "docker: $(docker --version 2>/dev/null || echo 'installed; relogin may be required for group access')"
echo "cloudflared: $CLOUDFLARED_BIN"
