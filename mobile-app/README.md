# Mobile App (Vite + React)

This folder now contains the primary app UI (mobile-first web app), replacing the old Expo React Native implementation.

## Stack
- React + TypeScript + Vite
- Tailwind + shadcn/ui
- Framer Motion
- React Router
- Local persistence with `localStorage`

## Features
- Tabs: Home, Search, Movies, Library, Player
- Movie list pagination and movie-song browsing
- Playback queue, mini-player, now-playing controls
- Shuffle/repeat/seek
- Liked songs and playlists
- Backend autocomplete search
- Download-link resolution for expiring upstream links

## API Configuration
Set backend base URL:
```bash
set VITE_API_BASE_URL=http://localhost:3000
```

Default fallback: `http://localhost:3000`

## Development
```bash
npm install
npm run dev
```

## Android Install (Capacitor)
```bash
npm install
set VITE_API_BASE_URL=http://<your-lan-ip>:3000
npm run build
npx cap sync android
npx cap open android
```

## Release Build (CLI)
1. Create release keystore (one-time):
```bash
cd android
keytool -genkey -v -keystore mt-mp3-release.jks -alias mtmp3 -keyalg RSA -keysize 2048 -validity 10000
```

2. Add signing entries in `android/gradle.properties`:
```properties
MYAPP_UPLOAD_STORE_FILE=mt-mp3-release.jks
MYAPP_UPLOAD_KEY_ALIAS=mtmp3
MYAPP_UPLOAD_STORE_PASSWORD=your_store_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

3. Build:
```bash
cd ..
set VITE_API_BASE_URL=http://<your-lan-ip>:3000
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
npm test
```

## Notes
- App resolves playback URLs through backend endpoints so short-lived source links are refreshed.
- LocalStorage is used for library persistence and song metadata caching.
