// ============================================================
// Types — matches real backend at /api/v1 exactly
// ============================================================

/** Raw movie item from GET /api/v1/movies */
export interface MovieItem {
  title: string;
  slug: string;
  path: string;
  url: string;
}

/** Raw song item from GET /api/v1/movies/:slug/songs */
export interface SongItem {
  movieId: number | null;
  songId?: number | null;
  songSlug: string | null;
  title: string | null;
  artists: string | null;
  movieTitle: string | null;
  imageName: string | null;
  songPagePath: string | null;
  songPageUrl: string | null;
  playerDownloadPath: string | null;
  download128Path: string | null;
  download320Path: string | null;
  download128Url: string | null;
  download320Url: string | null;
}

/** Standard API response envelope */
export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

/** GET /api/v1/movies response payload */
export interface MovieListData {
  source: string;
  page: number;
  count: number;
  items: MovieItem[];
}

/** GET /api/v1/movies/:slug/songs response payload */
export interface SongsData {
  slug: string;
  movieId: number | null;
  title: string;
  count: number;
  items: SongItem[];
}

/** Autocomplete result from GET /api/v1/search/autocomplete */
export interface AutocompleteItem {
  name: string;
  subtitle: string;
  slug: string;
  path: string;
  url: string;
}

// ============================================================
// App-level normalized types
// ============================================================

/** Normalized song used throughout the app UI */
export interface Song {
  id: string;
  movieId?: number | null;
  songSlug?: string | null;
  title: string;
  artist: string;
  movie: string;
  movieSlug?: string;
  imageUrl: string;
  duration?: number;
  downloadUrl?: string;
  downloadPath?: string | null;
  remoteUrl?: string;
  cacheKey?: string;
  year?: number;
}

/** Movie for display in grid/list views */
export interface Movie {
  slug: string;
  title: string;
  year?: number;
  imageUrl: string;
  songCount?: number;
}

/** Playlist stored locally */
export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
  createdAt: number;
}

export type RepeatMode = "off" | "all" | "one";
