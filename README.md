# mt-mp3 (MassTamilan API + Music App)

Unofficial MassTamilan stack with:
- Express backend API wrapper (`/api/v1`) with Swagger and tests
- Frontend music app in `mobile-app/` (Vite + React + Tailwind + Capacitor-ready)

## Current App Stack
- Backend: Node.js + Express
- Frontend (`mobile-app`): React web app (mobile-first UI), not Expo React Native

## Run Backend (API Server)
```bash
cd "C:\Users\aakas\Downloads\Test Project"
npm install
npm run dev
```

Backend URLs:
- `http://localhost:3000/api/v1`
- `http://localhost:3000/docs`
- `http://localhost:3000/swagger.json`

## Same Network Setup (Phone + PC)
1. Connect phone and PC to the same Wi-Fi.
2. Find PC IPv4:
```bash
ipconfig
```
Use the IPv4 value as `<your-lan-ip>` (example: `10.154.226.141`).

3. Verify backend from phone browser:
- `http://<your-lan-ip>:3000/api/v1/health`

## Run Frontend (Web/PWA Test)
```bash
cd mobile-app
npm install
npm run dev
```

Set API host for frontend:
```bash
$env:VITE_API_BASE_URL="http://<your-lan-ip>:3000"
```
Then open on phone browser:
- `http://<your-lan-ip>:8080`

## Install As Android App (Capacitor)
App name: `mt-mp3`  
App ID: `com.akashpugazh.mtmp3`

```bash
cd mobile-app
npm install
$env:VITE_API_BASE_URL="http://<your-lan-ip>:3000"
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:
1. Let Gradle sync finish.
2. Connect phone with USB debugging enabled.
3. Click `Run` to install on device.

## Install On Mobile Without Android Studio (CLI Only)
Prerequisites:
- JDK 21
- Android SDK command-line tools + platform-tools
- USB debugging enabled on phone

Terminal flow:
```bash
cd mobile-app
$env:VITE_API_BASE_URL="http://<your-lan-ip>:3000"
npm run build
npx cap sync android

cd android
.\gradlew.bat assembleDebug
adb devices
adb install -r .\app\build\outputs\apk\debug\app-debug.apk
```

One-command installer (from `mobile-app`):
```bash
$env:VITE_API_BASE_URL="http://<your-lan-ip>:3000"
npm run android:install
```

After install:
- Keep backend running on PC (`npm run dev`).
- Open `mt-mp3` app on phone.

## Generate Release App (APK / AAB)
1. Create keystore (one-time):
```bash
cd mobile-app\android
keytool -genkey -v -keystore mt-mp3-release.jks -alias mtmp3 -keyalg RSA -keysize 2048 -validity 10000
```

2. Add signing config in `mobile-app/android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=mt-mp3-release.jks
MYAPP_UPLOAD_KEY_ALIAS=mtmp3
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

3. Build web + sync Android:
```bash
cd mobile-app
$env:VITE_API_BASE_URL="http://<your-lan-ip>:3000"
npm run build
npx cap sync android
```

4. Build release binaries:
```bash
cd android
.\gradlew.bat assembleRelease
.\gradlew.bat bundleRelease
```

Output files:
- APK: `mobile-app/android/app/build/outputs/apk/release/app-release.apk`
- AAB: `mobile-app/android/app/build/outputs/bundle/release/app-release.aab`

## Backend Endpoints Used by App
- `GET /api/v1/movies`
- `GET /api/v1/movies/:slug/songs`
- `GET /api/v1/songs/:movieId/:songSlug`
- `GET /api/v1/search/autocomplete`
- `GET /api/v1/download/resolve`

## Docs
- [API endpoint analysis](./MASSTAMILAN_API_DOCUMENTATION.md)
- [Product requirements](./PRD.md)
- [Frontend app guide](./mobile-app/README.md)


## Mobile Connectivity Troubleshooting
1. Start backend with LAN binding (already default):
```bash
cd "C:\Users\aakas\Downloads\Test Project"
npm run dev
```
2. In PowerShell, set API base before building Android app:
```bash
cd mobile-app
$env:VITE_API_BASE_URL="http://<your-lan-ip>:3000"
npm run android:install
```
3. On phone browser, confirm backend is reachable:
- `http://<your-lan-ip>:3000/api/v1/health`
4. If phone cannot reach backend:
- Ensure PC and phone are on same Wi-Fi subnet.
- Allow Node.js through Windows Firewall (Private network).
- Verify backend is listening on all interfaces (`HOST=0.0.0.0`).
- Rebuild/reinstall app after changing `VITE_API_BASE_URL` (it is compile-time).
