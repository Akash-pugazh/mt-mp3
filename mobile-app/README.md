# Mobile App (React Native + Expo)

Cross-platform offline-first Tamil music player connected to the local Express API from this repository.

## Active UX

- Tabbed shell: `Home`, `Movies`, `Library`
- Persistent mini player
- Infinite movie/list loading
- Movie -> songs drill-down
- Liked songs + playlist management

## Playback and Cache Behavior

- First listen: stream remote URL and cache file in background.
- Next listens: use local cached file when present.
- If remote signed URLs expire, app re-fetches fresh song URLs through backend API flows.

## Tech Stack

- Expo SDK 54
- React Native 0.81
- React 19
- `expo-av` for playback
- `expo-file-system/legacy` for file cache ops
- AsyncStorage for library/cache index persistence

## Setup

```bash
cd mobile-app
npm install
npm run start
```

## API Configuration

Set API host in `src/config.ts` or env:

```bash
set EXPO_PUBLIC_API_BASE_URL=http://<your-lan-ip>:3000
```

Device rules:

- Android emulator: `http://10.0.2.2:3000`
- iOS simulator: `http://localhost:3000`
- Physical device: `http://<your-lan-ip>:3000`

## Validation

```bash
npm run typecheck
```

## Known Gaps

- No OS lockscreen/notification media controls yet.
- No download manager screen yet.
- No cache eviction settings UI yet.
