// --- Movie Types ---

export interface MovieItem {
  title: string;
  slug: string;
  path: string;
  url: string;
}

export interface MovieListData {
  source: string;
  page: number;
  count: number;
  items: MovieItem[];
}

// --- Song Types ---

export interface SongItem {
  movieId: number | null;
  songId?: number;
  songSlug: string | null;
  title: string;
  artists?: string | null;
  movieTitle?: string | null;
  imageName?: string | null;
  songPagePath: string | null;
  songPageUrl: string | null;
  playerDownloadPath?: string | null;
  download128Path: string | null;
  download320Path: string | null;
  download128Url?: string | null;
  download320Url?: string | null;
}

export interface SongsData {
  slug: string;
  movieId: number | null;
  title: string;
  count: number;
  items: SongItem[];
}

// --- Album Types ---

export interface AlbumData {
  title: string;
  slug: string;
  movieId: number | null;
  songs: SongItem[];
  zip128Path: string | null;
  zip320Path: string | null;
  zip128Url: string | null;
  zip320Url: string | null;
}

export interface SongPageData extends AlbumData {
  currentSong: SongItem | null;
}

// --- Autocomplete Types ---

export interface AutocompleteItem {
  name: string;
  subtitle: string;
  slug: string;
  path: string;
  url: string;
}

// --- Download Types ---

export interface ResolveDownloadResult {
  location: string | null;
  status: number;
}

// --- API Envelope Types ---

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorDetail {
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetail;
}

// --- Parser Internal Types ---

export interface AlbumTrack {
  songId: number;
  title: string;
  artists?: string | undefined;
  movieTitle?: string | undefined;
  imageName?: string | undefined;
  playerDownloadPath: string | null;
}

export interface RawAutocompleteItem {
  n: string;
  s: string;
  l: string;
}

export interface SongRow {
  movieId: number;
  songSlug: string;
  title: string;
  songPagePath: string | null;
  songPageUrl: string | null;
  download128Path: string | null;
  download320Path: string | null;
}

export interface DownloadEntry {
  movieId: number | null;
  songId: number;
  songSlug: string | null;
  title: string | null;
  songPagePath: string | null;
  songPageUrl: string | null;
  download128Path: string | null;
  download320Path: string | null;
}

// --- Query / Param Types ---

export interface MovieListQuery {
  source: string;
  page: number;
  letter?: string;
  year?: string;
  music?: string;
  keyword?: string;
}

export interface ListPathResult {
  path: string;
  params: Record<string, string | number | undefined>;
}
