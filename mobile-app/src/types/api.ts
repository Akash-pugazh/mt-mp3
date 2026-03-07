export type MovieItem = {
  title: string;
  slug: string;
  path: string;
  url: string;
};

export type SongItem = {
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
};

export type AppSong = {
  id: string;
  title: string;
  artists: string;
  movieTitle: string;
  artworkUrl?: string;
  remoteUrl: string;
  cacheKey: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

export type MovieListData = {
  source: string;
  page: number;
  count: number;
  items: MovieItem[];
};

export type SongsData = {
  slug: string;
  movieId: number | null;
  title: string;
  count: number;
  items: SongItem[];
};

export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
};

export type TabId = 'home' | 'movies' | 'library';
