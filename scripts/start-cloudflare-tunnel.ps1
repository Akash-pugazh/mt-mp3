$ErrorActionPreference = "Stop"

param(
  [string]$LocalUrl = "http://127.0.0.1:3000"
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$toolsDir = Join-Path $projectRoot ".tools"
$cloudflaredDir = Join-Path $toolsDir "cloudflared"
$cloudflaredExe = Join-Path $cloudflaredDir "cloudflared.exe"
$downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"

New-Item -ItemType Directory -Force -Path $cloudflaredDir | Out-Null

if (-not (Test-Path $cloudflaredExe)) {
  Write-Host "Downloading cloudflared..." -ForegroundColor Yellow
  Invoke-WebRequest -Uri $downloadUrl -OutFile $cloudflaredExe
}

Write-Host "Starting Cloudflare quick tunnel to $LocalUrl" -ForegroundColor Green
Write-Host "Keep this window open. Copy the https://*.trycloudflare.com URL once it appears." -ForegroundColor Cyan

& $cloudflaredExe tunnel --url $LocalUrl --no-autoupdate
