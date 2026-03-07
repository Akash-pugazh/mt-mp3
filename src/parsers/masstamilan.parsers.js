const cheerio = require('cheerio');
const { stripQueryAndHash, toAbsolute } = require('../utils/url');

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

function normalizeHref(href) {
  if (!href) return null;
  const stripped = stripQueryAndHash(href.trim());
  if (!stripped.startsWith('/')) return null;
  if (BLOCKED_ROOT_PATHS.has(stripped)) return null;
  return stripped;
}

function extractAlbumSlug(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 1) return null;

  const slug = segments[0];
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

function parseMovieListHtml(html, baseUrl) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const movies = [];

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

function parseAlbumTracksFromScript(html) {
  const scriptMatch = html.match(/window\.albumTracks\s*=\s*(\[[\s\S]*?\]);/);
  if (!scriptMatch) return [];

  try {
    const parsed = JSON.parse(scriptMatch[1]);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      songId: item.id,
      title: item.name,
      artists: item.artists,
      movieTitle: item.m_name,
      imageName: item.img_name,
      playerDownloadPath: item.dl_path || null,
    }));
  } catch (_err) {
    return [];
  }
}

function parseAlbumPageHtml(html, slug, baseUrl) {
  const $ = cheerio.load(html);
  const title = $('h1').first().text().replace(/\s+/g, ' ').trim() || slug;

  const songRows = [];
  const downloadsBySongId = new Map();
  let movieId = null;

  $('a[href]').each((_i, el) => {
    const href = normalizeHref($(el).attr('href'));
    if (!href) return;

    const songMatch = href.match(/^\/(\d+)\/([a-z0-9-]+)-mp3-song$/i);
    if (songMatch) {
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
      const songId = Number((d128Match || d320Match)[1]);
      const entry = downloadsBySongId.get(songId) || {
        movieId: null,
        songId,
        songSlug: null,
        title: $(el).attr('title') || null,
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
  const normalizedTitleMap = new Map(
    songRows.map((song) => [song.title.toLowerCase().trim(), song]),
  );
  const songs = [];

  for (const track of albumTracks) {
    const baseSong = normalizedTitleMap.get(track.title.toLowerCase().trim()) || {
      movieId: movieId || null,
      songSlug: null,
      title: track.title,
      songPagePath: null,
      songPageUrl: null,
      download128Path: null,
      download320Path: null,
    };
    const downloadPaths = downloadsBySongId.get(track.songId) || {};

    songs.push({
      ...baseSong,
      songId: track.songId,
      title: track.title || baseSong.title,
      artists: track.artists || null,
      movieTitle: track.movieTitle || title,
      imageName: track.imageName || null,
      playerDownloadPath: track.playerDownloadPath || null,
      download128Path: baseSong.download128Path || downloadPaths.download128Path || null,
      download320Path: baseSong.download320Path || downloadPaths.download320Path || null,
    });
  }

  if (songs.length === 0) {
    songs.push(...songRows);
  }

  const songsWithUrls = songs.map((song) => {
    const fallbackById = song.songId ? downloadsBySongId.get(song.songId) : null;

    return {
      ...song,
      download128Path: song.download128Path || fallbackById?.download128Path || null,
      download320Path: song.download320Path || fallbackById?.download320Path || null,
      download128Url:
        song.download128Path || fallbackById?.download128Path
          ? toAbsolute(baseUrl, song.download128Path || fallbackById?.download128Path)
          : null,
      download320Url:
        song.download320Path || fallbackById?.download320Path
          ? toAbsolute(baseUrl, song.download320Path || fallbackById?.download320Path)
          : null,
    };
  });

  const zip128Path =
    $('a[href^="/downloader/"][href*="/zip128/"]').first().attr('href') || null;
  const zip320Path =
    $('a[href^="/downloader/"][href*="/zip320/"]').first().attr('href') || null;

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

function parseSongPageHtml(html, movieId, songSlug, baseUrl) {
  const album = parseAlbumPageHtml(html, `${movieId}/${songSlug}-mp3-song`, baseUrl);
  const current = album.songs.find((song) => song.songSlug === songSlug) || null;

  return {
    ...album,
    currentSong: current,
  };
}

function parseAutocompleteJson(data, baseUrl) {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    name: item.n,
    subtitle: item.s,
    slug: item.l,
    path: `/${item.l}`,
    url: toAbsolute(baseUrl, `/${item.l}`),
  }));
}

module.exports = {
  parseMovieListHtml,
  parseAlbumPageHtml,
  parseSongPageHtml,
  parseAutocompleteJson,
};
