// ============================================================
// API Client — matches real backend at /api/v1
// ============================================================
import { API_BASE_URL, ARTWORK_BASE_URL } from './config';
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

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, `API ${res.status}: ${body}`);
  }

  return (await res.json()) as T;
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
    imageUrl: item.imageName
      ? `${ARTWORK_BASE_URL}/${encodeURIComponent(item.imageName)}.jpg`
      : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    remoteUrl: remoteUrl ?? undefined,
    downloadUrl: remoteUrl ?? undefined,
    downloadPath: item.download128Path ?? item.download320Path,
    cacheKey: `${movieTitle}-${title}-${songIdentity}`.toLowerCase(),
  };
}

// ── Public API ──

export type MovieSource = 'latest-updates' | 'tamil-songs' | 'movie-index';

export async function listMovies(
  source: MovieSource = 'latest-updates',
  page = 1
): Promise<{ items: Movie[]; page: number; count: number }> {
  try {
    const data = await fetchJson<ApiEnvelope<MovieListData>>(
      `/api/v1/movies?source=${source}&page=${page}`
    );
    const movies: Movie[] = data.data.items.map(item => ({
      slug: item.slug,
      title: item.title,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    }));
    return { items: movies, page: data.data.page, count: data.data.count };
  } catch {
    return { items: [], page: 1, count: 0 };
  }
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
