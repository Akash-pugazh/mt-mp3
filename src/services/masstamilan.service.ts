import NodeCache from 'node-cache';
import { env } from '../config/env.js';
import { AppError } from '../errors/AppError.js';
import { MasstamilanClient } from '../clients/masstamilan.client.js';
import {
  parseMovieListHtml,
  parseAlbumPageHtml,
  parseSongPageHtml,
  parseAutocompleteJson,
} from '../parsers/masstamilan.parsers.js';
import type { MovieListData, SongsData, MovieItem, SongItem } from '../../mobile-app/src/types/api.js';

function isMovieListData(obj: any): obj is MovieListData {
  return obj && typeof obj === 'object' &&
    typeof obj.source === 'string' &&
    typeof obj.page === 'number' &&
    typeof obj.count === 'number' &&
    Array.isArray(obj.items);
}

export class MasstamilanService {
  client: MasstamilanClient;
  cache: NodeCache;
  constructor() {
    this.client = new MasstamilanClient();
    this.cache = new NodeCache({ stdTTL: 120, checkperiod: 150, useClones: false });
  }

  buildListPath(query: { source: string; page: number; letter?: string; year?: string; music?: string; keyword?: string }) {
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

  async listMovies(query: { source: string; page: number; letter?: string; year?: string; music?: string; keyword?: string }): Promise<MovieListData> {
    const { path, params } = this.buildListPath(query);
    const cacheKey = `list:${path}:${JSON.stringify(params || {})}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const html = await this.client.fetchHtml(path, params);
    const movies = parseMovieListHtml(html, env.baseUrl);
    const result: MovieListData = {
      source: query.source,
      page: query.page,
      count: movies.length,
      items: movies as MovieItem[],
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async getAlbumBySlug(slug: string): Promise<any> {
    const cacheKey = `album:${slug}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const html = await this.client.fetchHtml(`/${slug}`);
    const album = parseAlbumPageHtml(html, slug, env.baseUrl);
    this.cache.set(cacheKey, album);
    return album;
  }

  async getSongsByAlbumSlug(slug: string): Promise<SongsData> {
    const album = await this.getAlbumBySlug(slug);
    return {
      slug,
      movieId: album.movieId,
      title: album.title,
      count: album.songs.length,
      items: album.songs,
    };
  }

  async getSongDetails(movieId: string, songSlug: string): Promise<any> {
    const path = `/${movieId}/${songSlug}-mp3-song`;
    const cacheKey = `song:${path}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const html = await this.client.fetchHtml(path);
    const songPage = parseSongPageHtml(html, movieId, songSlug, env.baseUrl);
    this.cache.set(cacheKey, songPage);
    return songPage;
  }

  async autocomplete(keyword: string): Promise<any[]> {
    const data = await this.client.fetchJson('/search/ac', { keyword });
    // TODO: Define a type for autocomplete results
    return parseAutocompleteJson(data, env.baseUrl) as any[];
  }

  async resolveDownload(pathOrUrl: string): Promise<any> {
    return this.client.resolveDownloadPath(pathOrUrl);
  }
}


