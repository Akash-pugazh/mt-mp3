import type { Request, Response } from 'express';
import { MasstamilanService } from '../services/masstamilan.service.js';
import type {
  MovieListData,
  SongsData,
  AlbumData,
  SongPageData,
  AutocompleteItem,
  ResolveDownloadResult,
  MovieListQuery,
} from '../types/api.types.js';

export class MasstamilanController {
  private readonly service: MasstamilanService;

  constructor() {
    this.service = new MasstamilanService();
  }

  listMovies = async (req: Request, res: Response): Promise<void> => {
    const data: MovieListData = await this.service.listMovies(req.query as unknown as MovieListQuery);
    res.json({ success: true, data });
  };

  getAlbum = async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params['slug'] ?? '');
    const data: AlbumData = await this.service.getAlbumBySlug(slug);
    res.json({ success: true, data });
  };

  getAlbumSongs = async (req: Request, res: Response): Promise<void> => {
    const slug = String(req.params['slug'] ?? '');
    const data: SongsData = await this.service.getSongsByAlbumSlug(slug);
    res.json({ success: true, data });
  };

  getSong = async (req: Request, res: Response): Promise<void> => {
    const movieId = String(req.params['movieId'] ?? '');
    const songSlug = String(req.params['songSlug'] ?? '');
    const data: SongPageData = await this.service.getSongDetails(movieId, songSlug);
    res.json({ success: true, data });
  };

  autocomplete = async (req: Request, res: Response): Promise<void> => {
    const data: AutocompleteItem[] = await this.service.autocomplete(String(req.query['keyword']));
    res.json({ success: true, data: { count: data.length, items: data } });
  };

  resolveDownload = async (req: Request, res: Response): Promise<void> => {
    const data: ResolveDownloadResult = await this.service.resolveDownload(String(req.query['path']));
    res.json({ success: true, data });
  };
}
