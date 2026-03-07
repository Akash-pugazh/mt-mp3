const { MasstamilanService } = require('../services/masstamilan.service');

class MasstamilanController {
  constructor() {
    this.service = new MasstamilanService();
  }

  listMovies = async (req, res) => {
    const data = await this.service.listMovies(req.query);
    res.json({ success: true, data });
  };

  getAlbum = async (req, res) => {
    const data = await this.service.getAlbumBySlug(req.params.slug);
    res.json({ success: true, data });
  };

  getAlbumSongs = async (req, res) => {
    const data = await this.service.getSongsByAlbumSlug(req.params.slug);
    res.json({ success: true, data });
  };

  getSong = async (req, res) => {
    const data = await this.service.getSongDetails(req.params.movieId, req.params.songSlug);
    res.json({ success: true, data });
  };

  autocomplete = async (req, res) => {
    const data = await this.service.autocomplete(req.query.keyword);
    res.json({ success: true, data: { count: data.length, items: data } });
  };

  resolveDownload = async (req, res) => {
    const data = await this.service.resolveDownload(req.query.path);
    res.json({ success: true, data });
  };
}

module.exports = { MasstamilanController };
