// ============================================================
// API Client — matches real backend at /api/v1
// ============================================================
import { API_BASE_URL, API_FALLBACK_BASE_URLS, ARTWORK_BASE_URL } from './config';
import { buildMasstamilanArtworkUrl, DEFAULT_ARTWORK_PREVIEW } from './images';
import type {
  ApiEnvelope, MovieListData, SongsData, AutocompleteItem,
  Song, Movie, SongItem,
} from '@/types/music';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const REQUEST_TIMEOUT_MS = 15000;
const API_BASE_STORAGE_KEY = 'mt_api_base_url';
const MOVIE_PREVIEW_CACHE_KEY = 'mt_movie_preview_cache_v1';
let lastWorkingBase: string | null = null;
const moviePreviewCache = new Map<string, string>();
const moviePreviewInFlight = new Map<string, Promise<string>>();

function normalizeBase(base: string): string {
  return base.replace(/\/+$/, '');
}

function getCandidateBases(): string[] {
  const candidates: string[] = [];
  const push = (value?: string | null) => {
    if (!value) return;
    const normalized = normalizeBase(value.trim());
    if (!normalized || candidates.includes(normalized)) return;
    candidates.push(normalized);
  };

  push(lastWorkingBase);
  push(API_BASE_URL);
  for (const fallback of API_FALLBACK_BASE_URLS) {
    push(fallback);
  }

  if (typeof window !== 'undefined') {
    try {
      const storedBase = window.localStorage.getItem(API_BASE_STORAGE_KEY);
      if (!import.meta.env.PROD || storedBase?.startsWith('https://')) {
        push(storedBase);
      }
    } catch {
      // ignore storage errors
    }

    const { protocol, hostname } = window.location;
    if (protocol.startsWith('http') && hostname) {
      push(`${protocol}//${hostname}:3000`);
    }
  }

  return candidates;
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = globalThis.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timeoutId);
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const bases = getCandidateBases();
  let lastError: Error | null = null;

  for (const base of bases) {
    const attempts = import.meta.env.PROD && base === API_BASE_URL ? 2 : 1;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const url = `${base}${path}`;
      try {
        const res = await fetchWithTimeout(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
          const body = await res.text();
          lastError = new ApiError(res.status, `API ${res.status}: ${body}`);
          continue;
        }

        lastWorkingBase = base;
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(API_BASE_STORAGE_KEY, base);
          } catch {
            // ignore storage errors
          }
        }

        return (await res.json()) as T;
      } catch (err) {
        lastError = err as Error;
        if (attempt < attempts - 1) {
          await sleep(1500);
        }
      }
    }
  }

  throw lastError ?? new Error('API request failed');
}

function readPreviewCacheFromStorage() {
  if (typeof window === 'undefined') return;
  if (moviePreviewCache.size > 0) return;
  try {
    const raw = window.localStorage.getItem(MOVIE_PREVIEW_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, string>;
    Object.entries(parsed).forEach(([slug, url]) => {
      if (slug && url) moviePreviewCache.set(slug, url);
    });
  } catch {
    // ignore storage parse failures
  }
}

function persistPreviewCacheToStorage() {
  if (typeof window === 'undefined') return;
  try {
    const payload = Object.fromEntries(moviePreviewCache.entries());
    window.localStorage.setItem(MOVIE_PREVIEW_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage write failures
  }
}

// ── Mapper: SongItem → Song ──
function toSong(item: SongItem, fallbackMovieSlug: string): Song | null {
  const title = item.title?.trim();
  const remoteUrl = item.download128Url ?? item.download320Url;
  if (!title) return null;

  const artists = item.artists?.trim() || 'Unknown Artist';
  const movieTitle = item.movieTitle?.trim() || fallbackMovieSlug;
  const songIdentity = item.songId
    ? `song-${item.songId}`
    : `${item.movieId ?? 'm'}-${item.songSlug ?? title.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id: songIdentity,
    movieId: item.movieId ?? null,
    songSlug: item.songSlug ?? null,
    title,
    artist: artists,
    movie: movieTitle,
    movieSlug: fallbackMovieSlug,
    imageUrl: buildMasstamilanArtworkUrl(ARTWORK_BASE_URL, item.imageName),
    remoteUrl: remoteUrl ?? undefined,
    downloadUrl: remoteUrl ?? undefined,
    downloadPath: item.download128Path ?? item.download320Path,
    cacheKey: `${movieTitle}-${title}-${songIdentity}`.toLowerCase(),
  };
}

// ── Public API ──

export type MovieSource = 'latest-updates' | 'tamil-songs';

async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function listMovies(
  source: MovieSource = 'latest-updates',
  page = 1
): Promise<{ items: Movie[]; page: number; count: number }> {
  const sources: MovieSource[] = source === 'latest-updates'
    ? ['latest-updates', 'tamil-songs']
    : ['tamil-songs', 'latest-updates'];

  for (const src of sources) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const data = await fetchJson<ApiEnvelope<MovieListData>>(
          `/api/v1/movies?source=${src}&page=${page}`
        );
        const movies: Movie[] = data.data.items.map(item => ({
          slug: item.slug,
          title: item.title,
          imageUrl: DEFAULT_ARTWORK_PREVIEW,
        }));
        if (movies.length > 0) {
          return { items: movies, page: data.data.page, count: data.data.count };
        }
      } catch {
        if (attempt === 0) {
          await sleep(250);
        }
      }
    }
  }

  return { items: [], page: 1, count: 0 };
}

export async function getMovieSongs(slug: string): Promise<{ title: string; songs: Song[] }> {
  try {
    const data = await fetchJson<ApiEnvelope<SongsData>>(
      `/api/v1/movies/${encodeURIComponent(slug)}/songs`
    );
    const songs = data.data.items
      .map(item => toSong(item, slug))
      .filter(Boolean) as Song[];
    return { title: data.data.title, songs };
  } catch {
    return { title: slug, songs: [] };
  }
}

export async function getMoviePreviewImage(slug: string): Promise<string> {
  if (!slug) return DEFAULT_ARTWORK_PREVIEW;

  readPreviewCacheFromStorage();

  const cached = moviePreviewCache.get(slug);
  if (cached) return cached;

  const existingInFlight = moviePreviewInFlight.get(slug);
  if (existingInFlight) return existingInFlight;

  const task = (async () => {
    const result = await getMovieSongs(slug);
    const preview = result.songs[0]?.imageUrl || DEFAULT_ARTWORK_PREVIEW;
    moviePreviewCache.set(slug, preview);
    persistPreviewCacheToStorage();
    return preview;
  })().finally(() => {
    moviePreviewInFlight.delete(slug);
  });

  moviePreviewInFlight.set(slug, task);
  return task;
}

export async function searchAutocomplete(keyword: string): Promise<AutocompleteItem[]> {
  if (!keyword.trim()) return [];
  try {
    const data = await fetchJson<ApiEnvelope<{ count: number; items: AutocompleteItem[] }>>(
      `/api/v1/search/autocomplete?keyword=${encodeURIComponent(keyword)}`
    );
    return data.data.items;
  } catch {
    return [];
  }
}

export async function resolveDownload(path: string): Promise<string | null> {
  try {
    const data = await fetchJson<ApiEnvelope<{ location: string | null; status: number }>>(
      `/api/v1/download/resolve?path=${encodeURIComponent(path)}`
    );
    return data.data.location;
  } catch {
    return null;
  }
}

export async function checkHealth(): Promise<boolean> {
  try {
    await fetchJson<any>('/api/v1/health');
    return true;
  } catch {
    return false;
  }
}

export async function resolvePlayableUrl(song: Song): Promise<string | null> {
  const fromSong = song.downloadPath ?? song.downloadUrl ?? song.remoteUrl;

  if (fromSong) {
    if (fromSong.startsWith('/downloader/') || fromSong.startsWith('/')) {
      return resolveDownload(fromSong);
    }
    return fromSong;
  }

  if (!song.movieId || !song.songSlug) return null;

  try {
    const details = await fetchJson<ApiEnvelope<{ currentSong: SongItem | null }>>(
      `/api/v1/songs/${song.movieId}/${encodeURIComponent(song.songSlug)}`
    );
    const item = details.data.currentSong;
    if (!item) return null;
    const candidate = item.download128Path ?? item.download320Path ?? item.download128Url ?? item.download320Url;
    if (!candidate) return null;
    if (candidate.startsWith('/downloader/') || candidate.startsWith('/')) {
      return resolveDownload(candidate);
    }
    return candidate;
  } catch {
    return null;
  }
}

export { ApiError };


