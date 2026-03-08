# PRD - MassTamilan Music Application

## Product Summary
Build a music application that browses Tamil movie songs from our backend and provides player + library experience.

## Current Technical Baseline (March 8, 2026)
- Backend: Express API wrapper for masstamilan.dev, Swagger, tests, anti-403 fallback.
- Frontend: `mobile-app/` migrated to Vite + React (mobile-first UI), replacing previous Expo React Native app.

## Core Features Implemented
- Home discovery feed (API-first with fallback).
- Movies tab with paginated loading.
- Movie songs page with play-all/shuffle.
- Search page with backend autocomplete.
- Library with liked songs + playlist CRUD.
- Persistent mini-player + immersive now-playing screen.
- Playback queue with shuffle/repeat/seek.
- Stream URL recovery via backend `download/resolve` and song-detail refresh.
- Local persistence for likes/playlists/recent/meta via localStorage.

## Backend Contracts Used
- `GET /api/v1/movies?source=latest-updates&page=N`
- `GET /api/v1/movies/:slug/songs`
- `GET /api/v1/songs/:movieId/:songSlug`
- `GET /api/v1/search/autocomplete?keyword=...`
- `GET /api/v1/download/resolve?path=...`

## Known Limitations
- Full offline binary audio caching is not implemented in web runtime.
- Large JS bundle warning exists; code-splitting can improve this.
- No lock-screen/background transport controls in web mode.

## Next Priorities
1. Add optional IndexedDB audio cache for offline replay in web/Capacitor runtime.
2. Add backend flattened songs feed endpoint for faster home load.
3. Split route bundles (`NowPlaying`, `Library`, `Movies`) for smaller initial load.

## Runbook
### Backend
```bash
npm install
npm run dev
```

### Frontend
```bash
cd mobile-app
npm install
npm run dev
```

Environment:
```bash
set VITE_API_BASE_URL=http://<your-lan-ip>:3000
```