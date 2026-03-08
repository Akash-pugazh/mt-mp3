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

## Validation
```bash
npm run build
npm test
```

## Notes
- App resolves playback URLs through backend endpoints so short-lived source links are refreshed.
- LocalStorage is used for library persistence and song metadata caching.