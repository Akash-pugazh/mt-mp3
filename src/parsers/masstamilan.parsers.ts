import * as cheerio from 'cheerio';
import { stripQueryAndHash, toAbsolute } from '../utils/url.js';
import type {
  MovieItem,
  SongItem,
  AlbumData,
  SongPageData,
  AutocompleteItem,
  AlbumTrack,
  RawAutocompleteItem,
  SongRow,
  DownloadEntry,
} from '../types/api.types.js';

const BLOCKED_ROOT_PATHS = new Set([
  '/',
  '/search',
  '/latest-updates',
  '/movie-index',
  '/tamil-songs',
  '/playlists',
  '/privacy',
  '/terms',
  '/disclaimer',
  '/contact',
  '#',
]);

function normalizeHref(href: string | undefined): string | null {
  if (!href) return null;
  const stripped = stripQueryAndHash(href.trim());
  if (!stripped.startsWith('/')) return null;
  if (BLOCKED_ROOT_PATHS.has(stripped)) return null;
  return stripped;
}

function extractAlbumSlug(pathname: string): string | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return null;

  const slug = segments[0]!;
  if (/\.(png|css|js|xml|txt|ico|jpg|jpeg|webp)$/i.test(slug)) {
    return null;
  }

  const blockedPrefixes = [
    'assets',
    'downloader',
    'music',
    'tag',
    'browse-by-year',
    'playlists',
    'cdn-cgi',
  ];

  if (blockedPrefixes.some((prefix) => slug.startsWith(prefix))) {
    return null;
  }

  return slug;
}

export function parseMovieListHtml(html: string, baseUrl: string): MovieItem[] {
  const $ = cheerio.load(html);
  const seen = new Set<string>();
  const movies: MovieItem[] = [];

  $('a[href]').each((_i, el) => {
    const href = normalizeHref($(el).attr('href'));
    if (!href) return;

    const slug = extractAlbumSlug(href);
    if (!slug || seen.has(slug)) return;

    const title = $(el).text().replace(/\s+/g, ' ').trim();
    if (!title) return;

    seen.add(slug);
    movies.push({
      title,
      slug,
      path: `/${slug}`,
      url: toAbsolute(baseUrl, `/${slug}`),
    });
  });

  return movies;
}

function parseAlbumTracksFromScript(html: string): AlbumTrack[] {
  const scriptMatch = html.match(/window\.albumTracks\s*=\s*(\[[\s\S]*?\]);/);
  if (!scriptMatch?.[1]) return [];

  try {
    const parsed: unknown = JSON.parse(scriptMatch[1]);
    if (!Array.isArray(parsed)) return [];

    return (parsed as Array<Record<string, unknown>>).map((item) => ({
      songId: item['id'] as number,
      title: item['name'] as string,
      artists: item['artists'] as string | undefined,
      movieTitle: item['m_name'] as string | undefined,
      imageName: item['img_name'] as string | undefined,
      playerDownloadPath: (item['dl_path'] as string) || null,
    }));
  } catch {
    return [];
  }
}

export function parseAlbumPageHtml(html: string, slug: string, baseUrl: string): AlbumData {
  const $ = cheerio.load(html);
  const title = $('h1').first().text().replace(/\s+/g, ' ').trim() || slug;

  const songRows: SongRow[] = [];
  const downloadsBySongId = new Map<number, DownloadEntry>();
  let movieId: number | null = null;

  $('a[href]').each((_i, el) => {
    const href = normalizeHref($(el).attr('href'));
    if (!href) return;

    const songMatch = href.match(/^\/(\d+)\/([a-z0-9-]+)-mp3-song$/i);
    if (songMatch?.[1] && songMatch[2]) {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      songRows.push({
        movieId: Number(songMatch[1]),
        songSlug: songMatch[2],
        title: text || songMatch[2],
        songPagePath: href,
        songPageUrl: toAbsolute(baseUrl, href),
        download128Path: null,
        download320Path: null,
      });
      movieId = Number(songMatch[1]);
      return;
    }

    const d128Match = href.match(/^\/downloader\/[^/]+\/\d+\/d128_cdn\/(\d+)\//i);
    const d320Match = href.match(/^\/downloader\/[^/]+\/\d+\/d320_cdn\/(\d+)\//i);

    if (d128Match || d320Match) {
      const songId = Number((d128Match ?? d320Match)![1]);
      const entry: DownloadEntry = downloadsBySongId.get(songId) ?? {
        movieId: null,
        songId,
        songSlug: null,
        title: $(el).attr('title') ?? null,
        songPagePath: null,
        songPageUrl: null,
        download128Path: null,
        download320Path: null,
      };

      if (d128Match) entry.download128Path = href;
      if (d320Match) entry.download320Path = href;
      downloadsBySongId.set(songId, entry);
    }
  });

  const albumTracks = parseAlbumTracksFromScript(html);
  const normalizedTitleMap = new Map<string, SongRow>(
    songRows.map((song) => [song.title.toLowerCase().trim(), song]),
  );
  const songs: SongItem[] = [];

  for (const track of albumTracks) {
    const baseSong: SongRow | undefined = normalizedTitleMap.get(track.title.toLowerCase().trim());
    const baseSongDefaults = baseSong ?? {
      movieId: movieId ?? null as number | null,
      songSlug: '',
      title: track.title,
      songPagePath: null as string | null,
      songPageUrl: null as string | null,
      download128Path: null as string | null,
      download320Path: null as string | null,
    };
    const downloadPaths = downloadsBySongId.get(track.songId);

    songs.push({
      ...baseSongDefaults,
      songId: track.songId,
      title: track.title || baseSongDefaults.title,
      artists: track.artists ?? null,
      movieTitle: track.movieTitle ?? title,
      imageName: track.imageName ?? null,
      playerDownloadPath: track.playerDownloadPath ?? null,
      download128Path: baseSongDefaults.download128Path ?? downloadPaths?.download128Path ?? null,
      download320Path: baseSongDefaults.download320Path ?? downloadPaths?.download320Path ?? null,
    });
  }

  if (songs.length === 0) {
    songs.push(
      ...songRows.map((row): SongItem => ({
        movieId: row.movieId,
        songSlug: row.songSlug,
        title: row.title,
        songPagePath: row.songPagePath,
        songPageUrl: row.songPageUrl,
        download128Path: row.download128Path,
        download320Path: row.download320Path,
        artists: null,
        movieTitle: null,
        imageName: null,
        playerDownloadPath: null,
      })),
    );
  }

  const songsWithUrls: SongItem[] = songs.map((song) => {
    const fallbackById = song.songId ? downloadsBySongId.get(song.songId) : null;

    return {
      ...song,
      download128Path: song.download128Path ?? fallbackById?.download128Path ?? null,
      download320Path: song.download320Path ?? fallbackById?.download320Path ?? null,
      download128Url:
        song.download128Path ?? fallbackById?.download128Path
          ? toAbsolute(baseUrl, (song.download128Path ?? fallbackById?.download128Path)!)
          : null,
      download320Url:
        song.download320Path ?? fallbackById?.download320Path
          ? toAbsolute(baseUrl, (song.download320Path ?? fallbackById?.download320Path)!)
          : null,
    };
  });

  const zip128Path =
    $('a[href^="/downloader/"][href*="/zip128/"]').first().attr('href') ?? null;
  const zip320Path =
    $('a[href^="/downloader/"][href*="/zip320/"]').first().attr('href') ?? null;

  return {
    title,
    slug,
    movieId,
    songs: songsWithUrls,
    zip128Path,
    zip320Path,
    zip128Url: zip128Path ? toAbsolute(baseUrl, zip128Path) : null,
    zip320Url: zip320Path ? toAbsolute(baseUrl, zip320Path) : null,
  };
}

export function parseSongPageHtml(
  html: string,
  movieId: string,
  songSlug: string,
  baseUrl: string,
): SongPageData {
  const album = parseAlbumPageHtml(html, `${movieId}/${songSlug}-mp3-song`, baseUrl);
  const current = album.songs.find((song) => song.songSlug === songSlug) ?? null;

  return {
    ...album,
    currentSong: current,
  };
}

export function parseAutocompleteJson(
  data: unknown,
  baseUrl: string,
): AutocompleteItem[] {
  if (!Array.isArray(data)) return [];

  return (data as RawAutocompleteItem[]).map((item) => ({
    name: item.n,
    subtitle: item.s,
    slug: item.l,
    path: `/${item.l}`,
    url: toAbsolute(baseUrl, `/${item.l}`),
  }));
}
