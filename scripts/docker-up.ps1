$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env.local"
$exampleFile = Join-Path $projectRoot ".env.local.example"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw "Docker is not installed or not on PATH."
}

if (-not (Test-Path $envFile)) {
  Copy-Item $exampleFile $envFile
  Write-Host "Created .env.local from .env.local.example" -ForegroundColor Yellow
}

Push-Location $projectRoot
try {
  docker compose up -d --build
  Write-Host "API is starting on http://127.0.0.1:3000" -ForegroundColor Green
} finally {
  Pop-Location
}
