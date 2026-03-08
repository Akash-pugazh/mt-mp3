// ============================================================
// Mapper — converts raw SongItem to normalized Song
// ============================================================
import { ARTWORK_BASE_URL } from './config';
import type { SongItem, Song } from '@/types/music';

export function toAppSong(input: SongItem, fallbackMovieSlug: string): Song | null {
  const title = input.title?.trim();
  const remoteUrl = input.download128Url ?? input.download320Url;

  if (!title) return null;

  const artists = input.artists?.trim() || 'Unknown Artist';
  const movieTitle = input.movieTitle?.trim() || fallbackMovieSlug;

  const songIdentity = input.songId
    ? `song-${input.songId}`
    : `${input.movieId ?? 'm'}-${input.songSlug ?? title.toLowerCase().replace(/\s+/g, '-')}`;

  return {
    id: songIdentity,
    title,
    artist: artists,
    movie: movieTitle,
    movieSlug: fallbackMovieSlug,
    imageUrl: input.imageName
      ? `${ARTWORK_BASE_URL}/${encodeURIComponent(input.imageName)}.jpg`
      : 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    remoteUrl: remoteUrl ?? undefined,
    downloadUrl: remoteUrl ?? undefined,
    cacheKey: `${movieTitle}-${title}-${songIdentity}`.toLowerCase(),
  };
}
