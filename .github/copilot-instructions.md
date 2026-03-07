# Copilot Instructions for MassTamilan Express API + Mobile Player

## Build, Test, and Lint Commands

### Backend (Node.js/Express)

- **Install dependencies:**
  ```bash
  npm install
  ```
- **Start in dev mode:**
  ```bash
  npm run dev
  ```
- **Start in production:**
  ```bash
  npm start
  ```
- **Lint code:**
  ```bash
  npm run lint
  ```
- **Format code:**
  ```bash
  npm run format
  ```
- **Run all tests:**
  ```bash
  npm test
  ```
- **Run Swagger integration tests:**
  ```bash
  npm run test:swagger
  ```
- **Run a single test file:**
  ```bash
  npx jest path/to/testfile.js
  ```

### Mobile App (React Native + Expo)

- **Install dependencies:**
  ```bash
  cd mobile-app
  npm install
  ```
- **Start Expo app:**
  ```bash
  npm run start
  ```
- **Typecheck:**
  ```bash
  npm run typecheck
  ```

## High-Level Architecture

- **Backend:**
  - Express API wrapper for masstamilan.dev, with layered structure:
    - `src/app.js` (entry)
    - `src/routes/v1/masstamilan.routes.js` (routing)
    - `src/controllers/masstamilan.controller.js` (request handling)
    - `src/services/masstamilan.service.js` (business logic)
    - `src/clients/masstamilan.client.js` (HTTP scraping)
    - `src/parsers/masstamilan.parser.js` (HTML/JSON parsing)
  - Swagger docs at `/docs` and `/swagger.json`.
  - Centralized error handling, Zod validation, security middleware, rate limiting, and anti-403 fallback.
  - Tests in `tests/`.

- **Mobile App:**
  - Expo/React Native app in `mobile-app/`.
  - Main entry: `mobile-app/App.tsx`.
  - Tabbed UI: Home, Movies, Library.
  - Core screens: `src/screens/app-shell.tsx`, `home-tab.tsx`, `movies-tab.tsx`, `library-tab.tsx`.
  - Contexts: `player-context.tsx`, `library-context.tsx`.
  - Offline-first cache: `src/services/cache.ts`.
  - API base URL set in `src/config.ts` or via `EXPO_PUBLIC_API_BASE_URL` env var.

## Key Conventions

- **API endpoints** are versioned under `/api/v1/`.
- **Swagger/OpenAPI** is always available at `/docs` and `/swagger.json`.
- **Mobile app** expects backend to be running and reachable via LAN IP for real-device testing.
- **Song playback**: First play streams and caches, subsequent plays use local cache.
- **Error handling**: Backend uses Zod for input validation and returns consistent error shapes.
- **Rate limiting** and anti-bot strategies are enforced in backend middleware.
- **Testing**: Use `npm run test:swagger` for integration tests against the OpenAPI spec.
- **Mobile cache**: Uses `expo-file-system/legacy` and AsyncStorage for persistence.

---

This file summarizes build/test commands, architecture, and conventions for Copilot and other AI assistants. If you want to adjust coverage or add more details, let me know!
