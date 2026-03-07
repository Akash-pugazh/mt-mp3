# PRD - MassTamilan Cross-Platform Offline Player

## 1. Product Summary
Build a cross-platform app that lets users browse Tamil movie songs, stream them, and automatically cache songs for offline replay.

Core behavior:
- First listen: stream + download.
- Next listens: prefer cached local file.

## 2. Objectives
- Reliable playback from unstable upstream links.
- Fast browsing of recent movies and songs.
- Local-player-like UX with persistent library state.

## 3. In Scope
- Backend API wrapper over `masstamilan.dev`.
- Mobile app with Home/Movies/Library tabs.
- Song playback, queue, progress controls.
- Liked songs and playlists.
- Offline cache-first replay.

## 4. Out of Scope (Current Phase)
- User accounts and cloud sync.
- Social sharing.
- Subscription/payments.
- DRM protections.

## 5. Completed Work

### 5.1 Backend
- Layered architecture: routes/controllers/services/clients/parsers.
- Zod validation and centralized error handling.
- Security middleware + rate limiting + request IDs.
- Swagger at `/docs` and `/swagger.json`.
- Tests for parser and Swagger routes.
- Anti-403 strategy with browser headers + curl fallback.

### 5.2 Mobile
- Expo app bootstrapped and stabilized on SDK 54 dependencies.
- Offline-first cache service implemented.
- Tabbed shell implemented.
- Infinite list loading for movie-driven song discovery.
- Library features implemented (liked songs + playlists).

### 5.3 UI Rollback Baseline (March 7, 2026)
- Reverted the last two immersive UI checkpoints.
- Current baseline is stable tabbed player UX.

## 6. Current Architecture

### 6.1 Backend
- `src/app.js`
- `src/routes/v1/masstamilan.routes.js`
- `src/controllers/masstamilan.controller.js`
- `src/services/masstamilan.service.js`
- `src/clients/masstamilan.client.js`
- `src/parsers/masstamilan.parser.js`

### 6.2 Mobile
- `mobile-app/App.tsx`
- `mobile-app/src/screens/app-shell.tsx`
- `mobile-app/src/screens/home-tab.tsx`
- `mobile-app/src/screens/movies-tab.tsx`
- `mobile-app/src/screens/library-tab.tsx`
- `mobile-app/src/context/player-context.tsx`
- `mobile-app/src/context/library-context.tsx`
- `mobile-app/src/services/cache.ts`

## 7. Functional Requirements
- List recent movies and songs.
- Open movie details and play songs.
- Auto-download on first playback.
- Cache-first replay afterward.
- Manage liked songs and playlists.

## 8. Non-Functional Requirements
- API input validation and bounded rate usage.
- Resilient handling of upstream 403/token expiry.
- Maintainable, typed mobile codebase.
- Documentation aligned with runtime behavior.

## 9. Known Limitations
- No single flattened "all songs" backend feed endpoint yet.
- No background transport controls yet.
- No cache management UI yet.

## 10. Next Phases

### Phase A
- Add `GET /api/v1/songs/feed` (flattened default feed).
- Backend-side metadata cache for feed speed.
- Mobile retry/banner UX for transient network failures.

### Phase B
- Download manager screen.
- Recently played section.
- Cache cleanup controls.

### Phase C
- Lock screen/media notification controls.
- Advanced now-playing screen on top of stable baseline.
- Lightweight telemetry.

## 11. Acceptance Criteria
- Backend serves Swagger and core API routes.
- Mobile launches and plays songs from backend.
- Cache is created after first listen and reused on replay.
- Movies tab pagination works.
- Library state persists for likes and playlists.

## 12. Runbook

### Backend
```bash
npm install
npm run dev
```

### Mobile
```bash
cd mobile-app
npm install
npm run start
```

Use LAN IP for real-device testing in `EXPO_PUBLIC_API_BASE_URL`.

## 13. Change Log
- Added complete Express API wrapper and Swagger docs.
- Added parser/swagger tests.
- Added anti-403 curl fallback path.
- Added cross-platform Expo app with offline cache behavior.
- Added tabbed UX with infinite lists and library features.
- Stabilized dependencies on Expo SDK 54 stack.
- Reverted last two immersive UI checkpoints; restored stable tabbed baseline.