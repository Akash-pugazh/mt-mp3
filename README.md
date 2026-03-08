# MassTamilan Express API + Mobile Player

Unofficial integration project for `https://www.masstamilan.dev`.

This repository contains:

- A production-style Express API wrapper with Swagger and tests.
- A React Native (Expo) mobile app with offline-first playback, movie browsing, liked songs, and playlists.

## Current Status (March 7, 2026)

- Backend API is working with anti-403 fallback handling.
- Swagger docs are available at `/docs` and `/swagger.json`.
- Mobile app is on Expo SDK 54 stack.
- Active mobile UI is the stable tabbed experience (`Home`, `Movies`, `Library`).

## Repository Structure

```text
src/                 # backend source
tests/               # backend tests
mobile-app/          # React Native Expo app
PRD.md               # product requirements and roadmap
MASSTAMILAN_API_DOCUMENTATION.md  # upstream endpoint analysis
```

## Backend Quick Start

```bash
npm install
npm run dev
```

Backend URLs:

- API root: `http://localhost:3000/api/v1`
- Health: `http://localhost:3000/api/v1/health`
- Swagger UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/swagger.json`

## Mobile Quick Start

```bash
cd mobile-app
npm install
npm run start
```

Set API base URL in `mobile-app/src/config.ts` or via env:

```bash
set EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:3000
```

## Key Backend Endpoints

- `GET /api/v1/movies`
- `GET /api/v1/movies/:slug`
- `GET /api/v1/movies/:slug/songs`
- `GET /api/v1/songs/:movieId/:songSlug`
- `GET /api/v1/search/autocomplete`
- `GET /api/v1/download/resolve`

## Quality Commands (Backend)

```bash
npm run lint
npm test
npm run test:swagger
```

## Documentation Index

- [API upstream analysis](./MASSTAMILAN_API_DOCUMENTATION.md)
- [Product requirements](./PRD.md)
- [Mobile app guide](./mobile-app/README.md)

## Compliance Note

This is an unofficial scraper-based integration. Validate legal/licensing and distribution requirements before production use.
