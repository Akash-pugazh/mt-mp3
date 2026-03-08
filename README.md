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

## Local Production API Setup
This is the recommended way to run the scraper backend reliably, because the upstream source is blocking cloud/datacenter hosts like Render.

Files added for local hosting:
- `Dockerfile`
- `compose.yaml`
- `.env.local.example`
- `scripts/start-api-local.ps1`
- `scripts/docker-up.ps1`
- `scripts/start-cloudflare-tunnel.ps1`
- `scripts/show-health.ps1`

### Option A: Run directly on your machine
```bash
cd "C:\Users\aakas\Downloads\Test Project"
copy .env.local.example .env.local
powershell -ExecutionPolicy Bypass -File .\scripts\start-api-local.ps1
```

### Option B: Run in Docker Compose
Requirements:
- Docker Desktop installed and running

```bash
cd "C:\Users\aakas\Downloads\Test Project"
copy .env.local.example .env.local
powershell -ExecutionPolicy Bypass -File .\scripts\docker-up.ps1
```

This starts:
- `api`: your backend on `http://127.0.0.1:3000`
- `tunnel`: a Cloudflare Quick Tunnel pointing to `http://api:3000`

To print the current public URL again:
```bash
powershell -ExecutionPolicy Bypass -File .\scripts\show-tunnel-url.ps1
```

Health check:
```bash
powershell -ExecutionPolicy Bypass -File .\scripts\show-health.ps1
```

### Suggested production flow
1. Start API locally using Docker Compose or `start-api-local.ps1`.
2. Verify `http://127.0.0.1:3000/api/v1/health`.
3. Get the current `https://...trycloudflare.com` URL.
4. Put the tunnel URL into the mobile app as `VITE_API_BASE_URL` for builds, or configure the app to use that URL directly for testing.

## Linux Mint Zero-to-Running Setup
This is the simplest path if you want the backend to run from a Linux Mint machine with nothing preinstalled.

Scripts:
- `scripts/linux/setup-machine.sh`
- `scripts/linux/deploy-docker-compose.sh`
- `scripts/linux/start-api.sh`
- `scripts/linux/start-tunnel.sh`
- `scripts/linux/deploy-local-api.sh`
- `scripts/linux/stop-api.sh`
- `scripts/linux/stop-tunnel.sh`
- `scripts/linux/show-tunnel-url.sh`

## Single Docker Compose Flow
If Docker is available, use this same compose stack on Windows or Linux:

```bash
cp .env.local.example .env.local
docker compose up -d --build
```

Services:
- `api`
- `tunnel`

Get the current tunnel URL:

Windows:
```bash
powershell -ExecutionPolicy Bypass -File .\scripts\show-tunnel-url.ps1
```

Linux:
```bash
chmod +x scripts/linux/show-tunnel-url.sh
./scripts/linux/show-tunnel-url.sh
```

Stop everything:
```bash
docker compose down
```

Fresh Linux Mint machine with nothing installed:
```bash
cd /path/to/mt-mp3
chmod +x scripts/linux/*.sh
./scripts/linux/deploy-docker-compose.sh
```

Note:
- The Docker install step may require logging out and back in before non-sudo `docker` works, depending on group membership refresh.

One command to install dependencies, start the API, verify health, and expose it publicly:
```bash
cd /path/to/mt-mp3
chmod +x scripts/linux/*.sh
./scripts/linux/deploy-local-api.sh
```

What it does:
1. Installs Node.js 22 and required system packages
2. Downloads `cloudflared` into `.tools/cloudflared/`
3. Creates `.env.local` if missing
4. Installs npm dependencies
5. Builds and starts the API in the background
6. Starts a free Cloudflare Quick Tunnel in the background
7. Prints the public `https://...trycloudflare.com` URL

Useful commands:
```bash
./scripts/linux/start-api.sh
./scripts/linux/start-tunnel.sh
./scripts/linux/show-tunnel-url.sh
./scripts/linux/stop-api.sh
./scripts/linux/stop-tunnel.sh
tail -f logs/api.log
tail -f logs/cloudflared.log
```

Important notes:
- The quick tunnel URL is temporary and changes when the tunnel restarts.
- The API runs from your machine, which is the point: it avoids the cloud-IP blocking problem you hit on Render.
- If you reboot the Linux Mint machine, just run `./scripts/linux/deploy-local-api.sh` again.

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

## Free Deployment (Render)
This backend is ready to deploy on Render's free web service tier.

Files added for deployment:
- `render.yaml`: Render blueprint with build/start commands and env defaults

One-time steps:
1. Push this repository to GitHub.
2. Sign in to Render and choose `New +` -> `Blueprint`.
3. Select your GitHub repo and deploy the detected `render.yaml`.
4. After deploy completes, open:
   - `https://<your-service>.onrender.com/api/v1/health`
   - `https://<your-service>.onrender.com/docs`

Important notes:
- Free instances may sleep after inactivity, so the first request can be slow.
- Keep `CORS_ORIGIN=*` for testing, then tighten it later if you deploy the frontend separately.
- The app uses `PORT` from Render automatically; do not hardcode it.
- The Render build installs dev dependencies explicitly because `tsc` and `@types/node` are needed during build time.

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
- Pull-to-search gesture is available across app pages (opens shared search popup).
- Route-level scroll state is preserved per page when switching tabs/routes.
- Bottom navigation uses equal-width 4-slot layout with icon-only tabs.
- Notification/Media session controls are integrated for playback actions.

## Required After Every Frontend Change
For mobile-app changes, always run:
```bash
cd "C:\Users\aakas\Downloads\Test Project\mobile-app"
npm run android:install
```
This is required even if `npm run build` already passed.

## Troubleshooting
1. Keep backend running: `npm run dev` from repo root.
2. Verify backend health locally: `http://127.0.0.1:3000/api/v1/health`.
3. For USB device installs, use `npm run android:install` so `adb reverse` is applied.
4. If using Wi-Fi instead of USB, set `VITE_API_BASE_URL` to your LAN IP and ensure firewall allows Node.js.

## Documentation
- [Mobile App Guide](./mobile-app/README.md)
- [API Analysis](./MASSTAMILAN_API_DOCUMENTATION.md)
- [PRD](./PRD.md)
