# mt-mp3

Unofficial MassTamilan stack with:
- Express backend API wrapper (`/api/v1`) with Swagger
- Mobile-first React app in `mobile-app/` (Vite + Capacitor Android)

## Repository Layout
- `src/`: Express backend
- `tests/`: backend tests
- `mobile-app/src/`: app UI and player
- `mobile-app/android/`: Capacitor Android project

## Backend Setup
```bash
cd "C:\Users\aakas\Downloads\Test Project"
npm install
npm run dev
```

Backend endpoints:
- `http://localhost:3000/api/v1`
- `http://localhost:3000/docs`
- `http://localhost:3000/swagger.json`
- `http://localhost:3000/api/v1/health`

## Mobile App Setup (Web)
```bash
cd "C:\Users\aakas\Downloads\Test Project\mobile-app"
npm install
npm run dev
```

Optional API override at build/dev time:
```bash
$env:VITE_API_BASE_URL="http://localhost:3000"
```

Default runtime behavior:
- base: `http://localhost:3000`
- fallbacks: `http://127.0.0.1:3000`, `http://10.0.2.2:3000`

## Android Install (Recommended)
```bash
cd "C:\Users\aakas\Downloads\Test Project\mobile-app"
npm run android:install
```

What this script does:
1. Builds web assets
2. Runs `npx cap sync android`
3. Builds debug APK
4. Runs `adb reverse tcp:3000 tcp:3000`
5. Installs APK on connected device

This allows the app on phone to use `localhost:3000` and still hit backend running on your PC (USB connected).

## Android Studio Flow (Optional)
```bash
cd "C:\Users\aakas\Downloads\Test Project\mobile-app"
npm run build
npx cap sync android
npx cap open android
```

## Build Commands
Backend:
```bash
cd "C:\Users\aakas\Downloads\Test Project"
npm run build
```

Mobile app:
```bash
cd "C:\Users\aakas\Downloads\Test Project\mobile-app"
npm run build
```

## API Endpoints Used by Mobile App
- `GET /api/v1/movies`
- `GET /api/v1/movies/:slug/songs`
- `GET /api/v1/songs/:movieId/:songSlug`
- `GET /api/v1/search/autocomplete`
- `GET /api/v1/download/resolve`

## Playback + UI Notes
- Now Playing page is scrollable with full `Next Songs` list.
- Player center/disc section is fixed-height to avoid layout stutter on repeated next/previous.
- Song playback resolves stream URL on demand and starts with progressive buffering behavior.
- Song rows prefetch stream URL on touch/press for quicker perceived start.
- Movies page loads continuously while scrolling (infinite loading behavior).

## Troubleshooting
1. Keep backend running: `npm run dev` from repo root.
2. Verify backend health locally: `http://127.0.0.1:3000/api/v1/health`.
3. For USB device installs, use `npm run android:install` so `adb reverse` is applied.
4. If using Wi-Fi instead of USB, set `VITE_API_BASE_URL` to your LAN IP and ensure firewall allows Node.js.

## Documentation
- [Mobile App Guide](./mobile-app/README.md)
- [API Analysis](./MASSTAMILAN_API_DOCUMENTATION.md)
- [PRD](./PRD.md)
