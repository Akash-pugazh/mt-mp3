import {
  parseMovieListHtml,
  parseAlbumPageHtml,
  parseAutocompleteJson,
} from '../../src/parsers/masstamilan.parsers.js';

describe('masstamilan parsers', () => {
  test('parseMovieListHtml extracts album links', () => {
    const html = `
      <a href="/youth-2026-songs">Youth</a>
      <a href="/latest-updates">Latest</a>
      <a href="/dude-2025-songs">Dude</a>
    `;

    const movies = parseMovieListHtml(html, 'https://www.masstamilan.dev');
    expect(movies).toHaveLength(2);
    expect(movies[0]!.slug).toBe('youth-2026-songs');
  });

  test('parseAlbumPageHtml returns song links and zip links', () => {
    const html = `
      <h1>Youth</h1>
      <a href="/downloader/token/123/zip128/5990">zip 128</a>
      <a href="/5990/paranthene-penne-mp3-song">Paranthene Penne</a>
      <a href="/downloader/token/123/d128_cdn/43917/client">128</a>
      <a href="/downloader/token/123/d320_cdn/43917/client">320</a>
      <script>window.albumTracks = [{"id":43917,"name":"Paranthene Penne","artists":"Artist"}];</script>
    `;

    const album = parseAlbumPageHtml(html, 'youth-2026-songs', 'https://www.masstamilan.dev');
    expect(album.title).toBe('Youth');
    expect(album.songs).toHaveLength(1);
    expect(album.songs[0]!.download128Path).toContain('/downloader');
    expect(album.zip128Path).toContain('/zip128/5990');
  });

  test('parseAutocompleteJson maps response shape', () => {
    const items = parseAutocompleteJson(
      [{ n: 'Youth', s: 'Tamil', l: 'youth-2026-songs' }],
      'https://www.masstamilan.dev',
    );
    expect(items[0]!.slug).toBe('youth-2026-songs');
  });
});
