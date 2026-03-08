# Mobile App (`mobile-app`)

Vite + React + Capacitor Android client for `mt-mp3`.

## Stack
- React + TypeScript + Vite
- Tailwind + shadcn/ui
- Framer Motion
- React Router
- Capacitor Android
- Local persistence via `localStorage`

## Features
- Tabs: Home, Search, Movies, Library, Player
- Infinite-loading movies grid
- Movie songs listing with play/shuffle
- Queue-based playback with next/previous/shuffle/repeat/seek
- Scrollable Now Playing screen with full `Next Songs`
- Stable fixed middle player area (no vertical jump on next-song state updates)
- Liked songs and playlists
- Search autocomplete
- Download-link resolution via backend `download/resolve`
- Touch/press stream prefetch for faster song start

## API Base Configuration
Set at build/dev time when needed:
```bash
$env:VITE_API_BASE_URL="http://localhost:3000"
```

Runtime defaults:
- Primary: `http://localhost:3000`
- Fallbacks: `http://127.0.0.1:3000`, `http://10.0.2.2:3000`

## Development
```bash
npm install
npm run dev
```

## Android (One-command Install)
```bash
npm run android:install
```

`android:install` script:
1. `npm run build`
2. `npx cap sync android`
3. `gradlew assembleDebug`
4. `adb reverse tcp:3000 tcp:3000`
5. `adb install -r app-debug.apk`

Use this flow for USB-connected phones.

## Android Studio Flow
```bash
npm run build
npx cap sync android
npx cap open android
```

## Release Build (CLI)
1. Create keystore (one-time):
```bash
cd android
keytool -genkey -v -keystore mt-mp3-release.jks -alias mtmp3 -keyalg RSA -keysize 2048 -validity 10000
```

2. Configure signing in `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=mt-mp3-release.jks
MYAPP_UPLOAD_KEY_ALIAS=mtmp3
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

3. Build release artifacts:
```bash
cd ..
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleRelease
.\gradlew.bat bundleRelease
```

Artifacts:
- `android/app/build/outputs/apk/release/app-release.apk`
- `android/app/build/outputs/bundle/release/app-release.aab`

## Validation
```bash
npm run build
npm run test
```

## Notes
- Playback uses resolved upstream links and is designed for start-fast + continue-buffering behavior.
- Short-lived upstream download URLs are resolved on demand by backend.
