# mt-mp3 (MassTamilan API + Music App)

Unofficial MassTamilan stack with:
- Express backend API wrapper (`/api/v1`) with Swagger and tests
- Frontend music app in `mobile-app/` (Vite + React + Tailwind + Capacitor-ready)

## Current App Stack
- Backend: Node.js + Express
- Frontend (`mobile-app`): React web app (mobile-first UI), not Expo React Native

## Backend Run
```bash
npm install
npm run dev
```

Backend URLs:
- `http://localhost:3000/api/v1`
- `http://localhost:3000/docs`
- `http://localhost:3000/swagger.json`

## Frontend Run
```bash
cd mobile-app
npm install
npm run dev
```

Set API host for frontend:
```bash
set VITE_API_BASE_URL=http://<your-lan-ip>:3000
```

## Install As Android App (Capacitor)
App name: `mt-mp3`  
App ID: `com.akashpugazh.mtmp3`

```bash
cd mobile-app
npm install
set VITE_API_BASE_URL=http://<your-lan-ip>:3000
npm run build
npx cap sync android
npx cap open android
```

In Android Studio:
1. Let Gradle sync finish.
2. Connect phone with USB debugging enabled.
3. Click `Run` to install on device.

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
