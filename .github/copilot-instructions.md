# Copilot Instructions for MassTamilan Express API + Mobile App

## Build, Test, and Lint Commands

### Backend (`Test Project/`)
- Install:
  ```bash
  npm install
  ```
- Dev server:
  ```bash
  npm run dev
  ```
- Build:
  ```bash
  npm run build
  ```
- Lint:
  ```bash
  npm run lint
  ```
- Format:
  ```bash
  npm run format
  ```
- Tests:
  ```bash
  npm test
  npm run test:swagger
  npm run test:e2e
  ```

### Mobile App (`Test Project/mobile-app/`)
- Install:
  ```bash
  npm install
  ```
- Web dev:
  ```bash
  npm run dev
  ```
- Build:
  ```bash
  npm run build
  ```
- Android install/update (required after mobile changes):
  ```bash
  npm run android:install
  ```

## High-Level Architecture

### Backend
- Express + TypeScript API wrapper over `masstamilan.dev`.
- Key folders:
  - `src/routes/`
  - `src/controllers/`
  - `src/services/`
  - `src/clients/`
  - `src/parsers/`
- API versioning under `/api/v1`.
- Swagger/OpenAPI exposed at `/docs` and `/swagger.json`.
- Validation with Zod, standardized error responses, anti-bot fallback behavior.

### Mobile
- Vite + React + TypeScript + Capacitor Android (not Expo).
- Main app entry: `mobile-app/src/App.tsx`.
- Primary pages:
  - `src/pages/Home.tsx`
  - `src/pages/MoviesPage.tsx`
  - `src/pages/MovieSongsPage.tsx`
  - `src/pages/LibraryPage.tsx`
  - `src/pages/NowPlaying.tsx`
- Player state/context:
  - `src/contexts/PlayerContext.tsx`
- Shared UI + components under `src/components/`.

## Key Conventions
- Keep backend contracts under `/api/v1/*`.
- Mobile should prefer backend base URL fallbacks:
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://10.0.2.2:3000`
- For USB Android testing, use `npm run android:install` so `adb reverse` is applied.
- Playback is start-fast and progressive-buffering via `/api/v1/download/resolve`.
- After any mobile code/UI change, do not stop at `npm run build`; run full Android install flow.
