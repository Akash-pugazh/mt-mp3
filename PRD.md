# PRD - mt-mp3 (Current State)

## Product Summary
Mobile-first Tamil songs app powered by an unofficial Express API wrapper around masstamilan.dev.

## Current Baseline (March 8, 2026)
- Backend: Express + TypeScript API wrapper, Swagger docs, input validation, anti-bot fallbacks.
- Frontend: Vite + React + Capacitor Android app (replaced older Expo path).

## Current User Experience
- Home discovery from backend movie/song sources
- Movies tab with infinite fetch while scrolling
- Movie songs screen with play-all/shuffle
- Search autocomplete with shared popup UX
- Library with likes and playlist CRUD
- Mini player + Now Playing
- Queue playback: next/previous/shuffle/repeat/seek
- Pull-to-search gesture on major app pages
- Route-wise scroll restoration
- Notification bar / media-session transport controls

## Playback/Networking Behavior
- Song URLs are resolved on demand from backend endpoints.
- Resolver is tuned for start-fast playback and progressive buffering (no intentional full-file wait).
- Song rows prefetch stream URL on press/touch to reduce delay.

## UI Stability Goals (Implemented)
- Now Playing is scrollable.
- Middle player/disc section is fixed-height to avoid vertical stutter during next-song transitions.
- Full `Next Songs` list is visible via scrolling.
- Equal-width icon-only bottom nav layout.

## Backend Contracts Used by App
- `GET /api/v1/movies?source=...&page=...`
- `GET /api/v1/movies/:slug/songs`
- `GET /api/v1/songs/:movieId/:songSlug`
- `GET /api/v1/search/autocomplete?keyword=...`
- `GET /api/v1/download/resolve?path=...`

## Non-goals (Current)
- Full offline binary audio cache
- Complete offline catalog synchronization

## Next Priorities
1. Add explicit buffering/loading indicator in player controls.
2. Add route-level code splitting to reduce initial JS bundle size.
3. Add optional IndexedDB caching strategy for replay and low-connectivity mode.
4. Add visual E2E checklist for navigation/search/player regressions.

## Runbook
### Backend
```bash
cd "C:\Users\aakas\Downloads\Test Project"
npm install
npm run dev
```

### Mobile app
```bash
cd "C:\Users\aakas\Downloads\Test Project\mobile-app"
npm install
npm run android:install
```

Required workflow: after any mobile change, always run `npm run android:install`.
