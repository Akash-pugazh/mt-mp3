# MassTamilan.dev Endpoint Analysis and Unofficial API Documentation

Last verified: March 7, 2026
Base site: `https://www.masstamilan.dev`

## 1. Important Note

MassTamilan does not expose a stable official public REST API for full-catalog use.
This project uses an unofficial wrapper around HTML endpoints plus the autocomplete JSON endpoint.

Always verify legal/licensing constraints before enabling downloads in production.

## 2. Upstream Endpoint Map

### 2.1 Discovery / Listing (HTML)

- `GET /tamil-songs?page=N`
- `GET /latest-updates?page=N`
- `GET /movie-index`
- `GET /tag/{LETTER}?ref=mi&page=N`
- `GET /browse-by-year/{YYYY}?ref=mi&page=N`
- `GET /music/{music-director-slug}?page=N`
- `GET /search?keyword={query}&page=N`

### 2.2 Search (JSON)

- `GET /search/ac?keyword={query}`

Observed payload fields:

- `n`: display name
- `s`: subtitle
- `l`: album slug

### 2.3 Album / Song Pages (HTML)

- Album page: `GET /{album-slug}`
- Song page: `GET /{movieId}/{song-slug}-mp3-song`

Album pages typically include:

- Song links
- Tokenized downloader links
- `window.albumTracks = [...]` metadata blob

### 2.4 Downloader Route Pattern

- `GET /downloader/{token}/{expiry}/{variant}/...`
- Common variants: `d128_cdn`, `d320_cdn`, `p128_cdn`, `zip128`, `zip320`

Behavior:

- Returns redirect (`302`) to `masstamilan.download` signed URL
- Links are short-lived and should be resolved on demand

## 3. How This Repository Exposes a Stable API

Backend wrapper base:

- `http://localhost:3000/api/v1`

Mapped endpoints:

- `GET /movies`
- `GET /movies/:slug`
- `GET /movies/:slug/songs`
- `GET /songs/:movieId/:songSlug`
- `GET /search/autocomplete`
- `GET /download/resolve`

## 4. All Movies and Songs Strategy

There is no single upstream endpoint for a full catalog dump.

Practical approach:

1. Crawl listing sources (`tamil-songs`, `latest-updates`, `tag`, `year`, `music`).
2. Follow pagination until no new albums.
3. Parse each album page for song links and metadata.
4. Deduplicate by movie/song IDs.
5. Resolve download links just before playback/download.

## 5. Reliability Notes

- Upstream may return anti-bot `403/503`.
- This API includes browser-like headers and a curl fallback path.
- Keep retries bounded and rate limits enabled.
- Cache metadata; do not long-term cache signed download URLs.

## 6. Example Minimal Song Model

```json
{
  "movieId": 5990,
  "songId": 43917,
  "movieSlug": "youth-2026-songs",
  "songSlug": "paranthene-penne",
  "title": "Paranthene Penne",
  "downloadPath128": "/downloader/.../d128_cdn/43917/..."
}
```
