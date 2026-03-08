$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $projectRoot
try {
  if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker is not installed or not on PATH."
  }

  $output = docker compose logs tunnel --no-color 2>&1
  $match = [regex]::Matches(($output -join "`n"), 'https://[-0-9a-z]+\.trycloudflare\.com') | Select-Object -Last 1

  if (-not $match) {
    throw "Tunnel URL not found in docker compose logs. Run docker compose up -d first, then retry."
  }

  $match.Value
} finally {
  Pop-Location
}
