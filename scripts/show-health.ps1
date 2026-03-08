$ErrorActionPreference = "Stop"

param(
  [string]$BaseUrl = "http://127.0.0.1:3000"
)

$healthUrl = "$($BaseUrl.TrimEnd('/'))/api/v1/health"
Invoke-RestMethod -Uri $healthUrl -TimeoutSec 10 | ConvertTo-Json -Depth 5
