# MassTamilan API Analysis (Unofficial)

Last verified: March 8, 2026
Base site: `https://www.masstamilan.dev`

## Important
MassTamilan does not provide a stable official public REST API for full catalog access.
This repository uses an unofficial scrape-backed wrapper with validation, retries, and fallback behavior.

## Observed Upstream Endpoints

### Listings (HTML)
- `GET /tamil-songs?page=N`
- `GET /latest-updates?page=N`
- `GET /movie-index`
- `GET /tag/{LETTER}?ref=mi&page=N`
- `GET /browse-by-year/{YYYY}?ref=mi&page=N`
- `GET /music/{music-director-slug}?page=N`
- `GET /search?keyword={query}&page=N`

### Autocomplete (JSON)
- `GET /search/ac?keyword={query}`

Observed fields in upstream autocomplete payload:
- `n`: name
- `s`: subtitle
- `l`: album slug

### Album/Song Pages (HTML)
- Album page: `GET /{album-slug}`
- Song page: `GET /{movieId}/{song-slug}-mp3-song`

### Downloader Pattern
- `GET /downloader/{token}/{expiry}/{variant}/...`
- Common variants: `d128_cdn`, `d320_cdn`, `p128_cdn`, `zip128`, `zip320`

Behavior:
- Redirects to signed media URLs
- URLs are short-lived

## API Exposed by This Repository
Base: `http://localhost:3000/api/v1`

- `GET /health`
- `GET /movies`
- `GET /movies/:slug`
- `GET /movies/:slug/songs`
- `GET /songs/:movieId/:songSlug`
- `GET /search/autocomplete`
- `GET /download/resolve`

## Resolver Behavior (Current)
`/download/resolve` resolves playable URLs quickly using redirect-focused strategies:
1. redirect/headers-first resolution
2. fallback curl strategies (`HEAD+follow`, then range probe)

Goal: provide a playable URL early so clients can start playback immediately and continue buffering progressively.

## Reliability Notes
- Upstream can return anti-bot pages (`403/503`).
- Backend uses browser-like headers and curl fallback for resilience.
- Metadata can be cached briefly.
- Signed media links should be resolved on demand and not cached long-term.

## Suggested Crawl Strategy for Catalog Expansion
1. Crawl listing sources and pages
2. Parse album pages
3. Normalize and deduplicate by identifiers
4. Resolve media links only when required for playback/download
