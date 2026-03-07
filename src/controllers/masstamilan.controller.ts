import { MasstamilanService } from '../services/masstamilan.service.js';
import type { Request, Response } from 'express';
import type { MovieListData, SongsData } from '../../mobile-app/src/types/api.js';

export class MasstamilanController {
  service: MasstamilanService;
  constructor() {
    this.service = new MasstamilanService();
  }

  listMovies = async (req: Request, res: Response) => {
    const data: MovieListData = await this.service.listMovies(req.query as any);
    res.json({ success: true, data });
  };

  getAlbum = async (req: Request, res: Response) => {
    const data = await this.service.getAlbumBySlug(req.params.slug as string);
    res.json({ success: true, data });
  };

  getAlbumSongs = async (req: Request, res: Response) => {
    const data: SongsData = await this.service.getSongsByAlbumSlug(req.params.slug as string);
    res.json({ success: true, data });
  };

  getSong = async (req: Request, res: Response) => {
    const data = await this.service.getSongDetails(req.params.movieId as string, req.params.songSlug as string);
    res.json({ success: true, data });
  };

  autocomplete = async (req: Request, res: Response) => {
    const data = await this.service.autocomplete(req.query.keyword as string);
    res.json({ success: true, data: { count: data.length, items: data } });
  };

  resolveDownload = async (req: Request, res: Response) => {
    const data = await this.service.resolveDownload(req.query.path as string);
    res.json({ success: true, data });
  };
}


