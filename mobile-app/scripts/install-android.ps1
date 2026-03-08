$ErrorActionPreference = "Stop"

Write-Host "== MT-Mp3 Android install (debug) ==" -ForegroundColor Cyan

$projectRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $projectRoot "android"
$apkPath = Join-Path $androidDir "app\build\outputs\apk\debug\app-debug.apk"

if (-not $env:VITE_API_BASE_URL) {
  Write-Host "VITE_API_BASE_URL is not set. Development builds will use localhost defaults from app config." -ForegroundColor Yellow
}

# Prefer local JDK21 path used in this workspace; fallback to installed JDKs
$jdkCandidates = @(
  "C:\Users\aakas\tools\jdk21\jdk-21.0.10+7",
  "C:\Program Files\Microsoft\jdk-21.0.10.7-hotspot",
  "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"
)

$jdk = $jdkCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $jdk) {
  throw "JDK 21 not found. Install JDK 21 before running this script."
}

$env:JAVA_HOME = $jdk
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

$sdkRoot = Join-Path $env:USERPROFILE "Android\Sdk"
if (-not (Test-Path $sdkRoot)) {
  throw "Android SDK not found at $sdkRoot"
}

$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:Path = "$env:ANDROID_HOME\platform-tools;$env:Path"

Write-Host "1) Building web assets..." -ForegroundColor Green
Push-Location $projectRoot
npm run build
npx cap sync android
Pop-Location

Write-Host "2) Building Android debug APK..." -ForegroundColor Green
Push-Location $androidDir
Set-Content -Path "local.properties" -Value ("sdk.dir=" + ($env:ANDROID_HOME -replace "\\", "\\\\"))
.\gradlew.bat assembleDebug
Pop-Location

if (-not (Test-Path $apkPath)) {
  throw "APK not found at $apkPath"
}

Write-Host "3) Preparing USB networking (adb reverse tcp:3000 -> tcp:3000)..." -ForegroundColor Green
$devices = (& adb devices) -join "`n"
if ($devices -notmatch "`tdevice") {
  throw "No authorized Android device found. Check USB debugging and adb authorization."
}

adb reverse tcp:3000 tcp:3000

try {
  $null = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/v1/health" -TimeoutSec 3
  Write-Host "Local backend health check passed at http://127.0.0.1:3000/api/v1/health" -ForegroundColor DarkGreen
} catch {
  Write-Host "Warning: Backend health check failed on localhost:3000. Start backend with 'npm run dev' before using the app." -ForegroundColor Yellow
}

Write-Host "4) Installing on connected Android device..." -ForegroundColor Green
adb install -r $apkPath

Write-Host "Done. Latest debug APK installed." -ForegroundColor Cyan
