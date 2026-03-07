const NodeCache = require('node-cache');
const { env } = require('../config/env');
const { AppError } = require('../errors/AppError');
const { MasstamilanClient } = require('../clients/masstamilan.client');
const {
  parseMovieListHtml,
  parseAlbumPageHtml,
  parseSongPageHtml,
  parseAutocompleteJson,
} = require('../parsers/masstamilan.parsers');

class MasstamilanService {
  constructor() {
    this.client = new MasstamilanClient();
    this.cache = new NodeCache({ stdTTL: 120, checkperiod: 150, useClones: false });
  }

  buildListPath(query) {
    const { source, page, letter, year, music, keyword } = query;

    switch (source) {
      case 'tamil-songs':
        return { path: '/tamil-songs', params: { page } };
      case 'latest-updates':
        return { path: '/latest-updates', params: { page } };
      case 'tag':
        return { path: `/tag/${letter}`, params: { ref: 'mi', page } };
      case 'year':
        return { path: `/browse-by-year/${year}`, params: { ref: 'mi', page } };
      case 'music':
        return { path: `/music/${music}`, params: { page } };
      case 'search':
        return { path: '/search', params: { keyword, page } };
      default:
        throw new AppError('Unsupported source', 400, { source });
    }
  }

  async listMovies(query) {
    const { path, params } = this.buildListPath(query);
    const cacheKey = `list:${path}:${JSON.stringify(params || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const html = await this.client.fetchHtml(path, params);
    const movies = parseMovieListHtml(html, env.baseUrl);
    const result = {
      source: query.source,
      page: query.page,
      count: movies.length,
      items: movies,
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async getAlbumBySlug(slug) {
    const cacheKey = `album:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const html = await this.client.fetchHtml(`/${slug}`);
    const album = parseAlbumPageHtml(html, slug, env.baseUrl);
    this.cache.set(cacheKey, album);
    return album;
  }

  async getSongsByAlbumSlug(slug) {
    const album = await this.getAlbumBySlug(slug);
    return {
      slug,
      movieId: album.movieId,
      title: album.title,
      count: album.songs.length,
      items: album.songs,
    };
  }

  async getSongDetails(movieId, songSlug) {
    const path = `/${movieId}/${songSlug}-mp3-song`;
    const cacheKey = `song:${path}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const html = await this.client.fetchHtml(path);
    const songPage = parseSongPageHtml(html, movieId, songSlug, env.baseUrl);
    this.cache.set(cacheKey, songPage);
    return songPage;
  }

  async autocomplete(keyword) {
    const data = await this.client.fetchJson('/search/ac', { keyword });
    return parseAutocompleteJson(data, env.baseUrl);
  }

  async resolveDownload(pathOrUrl) {
    return this.client.resolveDownloadPath(pathOrUrl);
  }
}

module.exports = { MasstamilanService };
