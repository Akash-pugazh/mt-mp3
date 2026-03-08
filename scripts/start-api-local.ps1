$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env.local"
$exampleFile = Join-Path $projectRoot ".env.local.example"

if (-not (Test-Path $envFile)) {
  Copy-Item $exampleFile $envFile
  Write-Host "Created .env.local from .env.local.example" -ForegroundColor Yellow
}

Push-Location $projectRoot
try {
  npm install
  npm run build
  npm start
} finally {
  Pop-Location
}
