import type { AppSong, SongItem } from '../types/api';

export function toAppSong(input: SongItem, fallbackMovieSlug: string): AppSong | null {
  const title = input.title?.trim();
  const remoteUrl = input.download128Url ?? input.download320Url;

  if (!title || !remoteUrl) return null;

  const artists = input.artists?.trim() || 'Unknown Artist';
  const movieTitle = input.movieTitle?.trim() || fallbackMovieSlug;

  const songIdentity = input.songId
    ? `song-${input.songId}`
    : `${input.movieId ?? 'm'}-${input.songSlug ?? title.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id: songIdentity,
    title,
    artists,
    movieTitle,
    artworkUrl: input.imageName
      ? `https://www.masstamilan.dev/i/${encodeURIComponent(input.imageName)}.jpg`
      : undefined,
    remoteUrl,
    cacheKey: `${movieTitle}-${title}-${songIdentity}`.toLowerCase(),
  };
}
