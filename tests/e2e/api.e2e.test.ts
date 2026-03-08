/**
 * End-to-End API Tests for MassTamilan Express API
 *
 * Tests all API endpoints using supertest against the Express app.
 * The MasstamilanClient is mocked to avoid network calls to upstream.
 * Tests cover: routing, validation, error handling, response shapes, and middleware.
 */
import request from 'supertest';
import { app } from '../../src/app.js';
import { MasstamilanClient } from '../../src/clients/masstamilan.client.js';

// ---------------------------------------------------------------------------
// HTML fixtures for mocked upstream responses
// ---------------------------------------------------------------------------

const MOVIE_LIST_HTML = `
<html><body>
  <a href="/youth-2026-songs">Youth (2026)</a>
  <a href="/dude-2025-songs">Dude (2025)</a>
  <a href="/latest-updates">Latest Updates</a>
</body></html>
`;

const ALBUM_PAGE_HTML = `
<html><body>
  <h1>Youth (2026) Tamil Songs</h1>
  <a href="/5990/paranthene-penne-mp3-song">Paranthene Penne</a>
  <a href="/downloader/tok/999/d128_cdn/43917/x">128kbps</a>
  <a href="/downloader/tok/999/d320_cdn/43917/x">320kbps</a>
  <a href="/downloader/tok/999/zip128/5990">Zip 128</a>
  <script>
    window.albumTracks = [
      {"id":43917,"name":"Paranthene Penne","artists":"Anirudh","m_name":"Youth","img_name":"youth.jpg","dl_path":"/dl/43917"}
    ];
  </script>
</body></html>
`;

const SONG_PAGE_HTML = ALBUM_PAGE_HTML;

const AUTOCOMPLETE_JSON = [
  { n: 'Youth (2026)', s: '2026 Tamil Movie', l: 'youth-2026-songs' },
  { n: 'Dude (2025)', s: '2025 Tamil Movie', l: 'dude-2025-songs' },
];

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

jest.spyOn(MasstamilanClient.prototype, 'fetchHtml').mockImplementation(
  async (path: string): Promise<string> => {
    if (path.includes('/tamil-songs') || path.includes('/latest-updates') || path.includes('/search') || path.includes('/tag/') || path.includes('/browse-by-year/') || path.includes('/music/')) {
      return MOVIE_LIST_HTML;
    }
    if (path.match(/\/\d+\/[a-z0-9-]+-mp3-song/i)) {
      return SONG_PAGE_HTML;
    }
    // Default: album page
    return ALBUM_PAGE_HTML;
  },
);

jest.spyOn(MasstamilanClient.prototype, 'fetchJson').mockImplementation(
  async (): Promise<unknown> => {
    return AUTOCOMPLETE_JSON;
  },
);

jest.spyOn(MasstamilanClient.prototype, 'resolveDownloadPath').mockImplementation(
  async () => {
    return {
      location: 'https://masstamilan.download/files/song.mp3',
      status: 302,
    };
  },
);

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe('E2E: Root Endpoint', () => {
  test('GET / returns API info', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        message: 'MassTamilan Unofficial API',
        docs: '/docs',
        openapi: '/swagger.json',
        version: 'v1',
      },
    });
  });

  test('GET / includes x-request-id header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  test('Incoming x-request-id header is echoed back', async () => {
    const customId = 'test-request-id-12345';
    const res = await request(app)
      .get('/')
      .set('x-request-id', customId);
    expect(res.headers['x-request-id']).toBe(customId);
  });
});

describe('E2E: Health Endpoint', () => {
  test('GET /api/v1/health returns service metadata', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('name', 'masstamilan-express-api');
    expect(res.body.data).toHaveProperty('version', '1.0.0');
    expect(res.body.data).toHaveProperty('uptimeSeconds');
    expect(res.body.data).toHaveProperty('timestamp');
    expect(typeof res.body.data.uptimeSeconds).toBe('number');
  });
});

describe('E2E: List Movies', () => {
  test('GET /api/v1/movies returns movies with default source', async () => {
    const res = await request(app).get('/api/v1/movies');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('source', 'tamil-songs');
    expect(res.body.data).toHaveProperty('page', 1);
    expect(res.body.data).toHaveProperty('count');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.count).toBe(res.body.data.items.length);
  });

  test('GET /api/v1/movies?source=tamil-songs returns movie items with correct shape', async () => {
    const res = await request(app).get('/api/v1/movies?source=tamil-songs');
    expect(res.status).toBe(200);
    const items = res.body.data.items;
    expect(items.length).toBeGreaterThan(0);

    const firstItem = items[0];
    expect(firstItem).toHaveProperty('title');
    expect(firstItem).toHaveProperty('slug');
    expect(firstItem).toHaveProperty('path');
    expect(firstItem).toHaveProperty('url');
    expect(firstItem.slug).toBe('youth-2026-songs');
  });

  test('GET /api/v1/movies?source=latest-updates works', async () => {
    const res = await request(app).get('/api/v1/movies?source=latest-updates');
    expect(res.status).toBe(200);
    expect(res.body.data.source).toBe('latest-updates');
  });

  test('GET /api/v1/movies?source=tag&letter=A works', async () => {
    const res = await request(app).get('/api/v1/movies?source=tag&letter=A');
    expect(res.status).toBe(200);
    expect(res.body.data.source).toBe('tag');
  });

  test('GET /api/v1/movies?source=tag without letter returns 400', async () => {
    const res = await request(app).get('/api/v1/movies?source=tag');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/movies?source=year&year=2026 works', async () => {
    const res = await request(app).get('/api/v1/movies?source=year&year=2026');
    expect(res.status).toBe(200);
    expect(res.body.data.source).toBe('year');
  });

  test('GET /api/v1/movies?source=year without year returns 400', async () => {
    const res = await request(app).get('/api/v1/movies?source=year');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/movies?source=music&music=anirudh works', async () => {
    const res = await request(app).get('/api/v1/movies?source=music&music=anirudh');
    expect(res.status).toBe(200);
    expect(res.body.data.source).toBe('music');
  });

  test('GET /api/v1/movies?source=music without music returns 400', async () => {
    const res = await request(app).get('/api/v1/movies?source=music');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/movies?source=search&keyword=youth works', async () => {
    const res = await request(app).get('/api/v1/movies?source=search&keyword=youth');
    expect(res.status).toBe(200);
    expect(res.body.data.source).toBe('search');
  });

  test('GET /api/v1/movies?source=search without keyword returns 400', async () => {
    const res = await request(app).get('/api/v1/movies?source=search');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/movies?source=invalid returns 400', async () => {
    const res = await request(app).get('/api/v1/movies?source=invalid');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('message');
  });

  test('GET /api/v1/movies?page=0 returns 400 (page must be positive)', async () => {
    const res = await request(app).get('/api/v1/movies?page=0');
    expect(res.status).toBe(400);
  });

  test('GET /api/v1/movies?page=201 returns 400 (page must be <= 200)', async () => {
    const res = await request(app).get('/api/v1/movies?page=201');
    expect(res.status).toBe(400);
  });

  test('GET /api/v1/movies?page=2 returns page 2', async () => {
    const res = await request(app).get('/api/v1/movies?page=2');
    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(2);
  });
});

describe('E2E: Get Album', () => {
  test('GET /api/v1/movies/:slug returns album details', async () => {
    const res = await request(app).get('/api/v1/movies/youth-2026-songs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('slug', 'youth-2026-songs');
    expect(res.body.data).toHaveProperty('movieId');
    expect(res.body.data).toHaveProperty('songs');
    expect(Array.isArray(res.body.data.songs)).toBe(true);
    expect(res.body.data).toHaveProperty('zip128Path');
    expect(res.body.data).toHaveProperty('zip320Path');
  });

  test('GET /api/v1/movies/:slug returns songs with correct shape', async () => {
    const res = await request(app).get('/api/v1/movies/youth-2026-songs');
    const songs = res.body.data.songs;
    expect(songs.length).toBeGreaterThan(0);

    const song = songs[0];
    expect(song).toHaveProperty('title', 'Paranthene Penne');
    expect(song).toHaveProperty('songId', 43917);
    expect(song).toHaveProperty('artists', 'Anirudh');
    expect(song).toHaveProperty('download128Path');
    expect(song).toHaveProperty('download320Path');
    expect(song).toHaveProperty('download128Url');
    expect(song).toHaveProperty('download320Url');
  });
});

describe('E2E: Get Album Songs', () => {
  test('GET /api/v1/movies/:slug/songs returns songs list', async () => {
    const res = await request(app).get('/api/v1/movies/youth-2026-songs/songs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('slug', 'youth-2026-songs');
    expect(res.body.data).toHaveProperty('movieId');
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('count');
    expect(res.body.data).toHaveProperty('items');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.count).toBe(res.body.data.items.length);
  });
});

describe('E2E: Get Song Details', () => {
  test('GET /api/v1/songs/:movieId/:songSlug returns song details', async () => {
    const res = await request(app).get('/api/v1/songs/5990/paranthene-penne');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('title');
    expect(res.body.data).toHaveProperty('slug');
    expect(res.body.data).toHaveProperty('songs');
    expect(res.body.data).toHaveProperty('currentSong');
  });

  test('GET /api/v1/songs/abc/songslug returns 400 (movieId must be numeric)', async () => {
    const res = await request(app).get('/api/v1/songs/abc/songslug');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('GET /api/v1/songs/-1/songslug returns 400 (movieId must be positive)', async () => {
    const res = await request(app).get('/api/v1/songs/-1/songslug');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('E2E: Search Autocomplete', () => {
  test('GET /api/v1/search/autocomplete?keyword=youth returns results', async () => {
    const res = await request(app).get('/api/v1/search/autocomplete?keyword=youth');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('count');
    expect(res.body.data).toHaveProperty('items');
    expect(Array.isArray(res.body.data.items)).toBe(true);
    expect(res.body.data.count).toBe(res.body.data.items.length);
  });

  test('Autocomplete items have correct shape', async () => {
    const res = await request(app).get('/api/v1/search/autocomplete?keyword=youth');
    const items = res.body.data.items;
    expect(items.length).toBeGreaterThan(0);

    const item = items[0];
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('subtitle');
    expect(item).toHaveProperty('slug');
    expect(item).toHaveProperty('path');
    expect(item).toHaveProperty('url');
  });

  test('GET /api/v1/search/autocomplete without keyword returns 400', async () => {
    const res = await request(app).get('/api/v1/search/autocomplete');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('message');
  });
});

describe('E2E: Download Resolve', () => {
  test('GET /api/v1/download/resolve?path=/downloader/... returns resolved URL', async () => {
    const res = await request(app).get('/api/v1/download/resolve?path=/downloader/tok/999/d128_cdn/43917/x');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('location');
    expect(res.body.data).toHaveProperty('status');
    expect(typeof res.body.data.status).toBe('number');
  });

  test('GET /api/v1/download/resolve without path returns 400', async () => {
    const res = await request(app).get('/api/v1/download/resolve');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('E2E: 404 Not Found Handler', () => {
  test('Unknown route returns 404 with error envelope', async () => {
    const res = await request(app).get('/api/v1/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error.message).toContain('Route not found');
    expect(res.body.error).toHaveProperty('requestId');
  });

  test('Unknown POST route returns 404', async () => {
    const res = await request(app).post('/api/v1/movies');
    expect(res.status).toBe(404);
  });

  test('Deeply nested unknown route returns 404', async () => {
    const res = await request(app).get('/api/v1/a/b/c/d/e');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('E2E: Error Response Envelope', () => {
  test('Validation errors include standard error envelope', async () => {
    const res = await request(app).get('/api/v1/movies?source=invalid');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body.error).toHaveProperty('requestId');
    expect(typeof res.body.error.requestId).toBe('string');
  });

  test('400 errors include details array', async () => {
    const res = await request(app).get('/api/v1/movies?source=invalid');
    expect(res.body.error).toHaveProperty('details');
    expect(Array.isArray(res.body.error.details)).toBe(true);
  });
});

describe('E2E: Request ID Middleware', () => {
  test('Every response has x-request-id header', async () => {
    const endpoints = [
      '/api/v1/health',
      '/api/v1/movies',
      '/swagger.json',
    ];

    for (const endpoint of endpoints) {
      const res = await request(app).get(endpoint);
      expect(res.headers['x-request-id']).toBeDefined();
    }
  });

  test('Generated request IDs are unique', async () => {
    const res1 = await request(app).get('/');
    const res2 = await request(app).get('/');
    expect(res1.headers['x-request-id']).not.toBe(res2.headers['x-request-id']);
  });
});

describe('E2E: Swagger/OpenAPI', () => {
  test('GET /swagger.json returns valid OpenAPI 3.0.3 spec', async () => {
    const res = await request(app).get('/swagger.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toContain('MassTamilan');
    expect(res.body.info.version).toBe('1.0.0');
  });

  test('OpenAPI spec includes all expected paths', async () => {
    const res = await request(app).get('/swagger.json');
    const paths = Object.keys(res.body.paths);
    expect(paths).toContain('/api/v1/health');
    expect(paths).toContain('/api/v1/movies');
    expect(paths).toContain('/api/v1/movies/{slug}');
    expect(paths).toContain('/api/v1/movies/{slug}/songs');
    expect(paths).toContain('/api/v1/songs/{movieId}/{songSlug}');
    expect(paths).toContain('/api/v1/search/autocomplete');
    expect(paths).toContain('/api/v1/download/resolve');
    expect(paths).toContain('/swagger.json');
    expect(paths).toContain('/docs');
  });

  test('OpenAPI spec includes all expected schemas', async () => {
    const res = await request(app).get('/swagger.json');
    const schemas = Object.keys(res.body.components.schemas);
    expect(schemas).toContain('MovieItem');
    expect(schemas).toContain('SongItem');
    expect(schemas).toContain('ErrorResponse');
    expect(schemas).toContain('MovieListResponse');
    expect(schemas).toContain('AlbumResponse');
    expect(schemas).toContain('SongListResponse');
    expect(schemas).toContain('AutocompleteResponse');
    expect(schemas).toContain('ResolveDownloadResponse');
  });

  test('GET /docs/ returns Swagger UI HTML', async () => {
    const res = await request(app).get('/docs/');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/html');
    expect(res.text).toContain('swagger-ui');
  });
});

describe('E2E: Security Headers', () => {
  test('Responses include security headers from helmet', async () => {
    const res = await request(app).get('/');
    // helmet sets these by default
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBeDefined();
  });

  test('X-Powered-By header is disabled', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('E2E: CORS', () => {
  test('CORS headers are present on responses', async () => {
    const res = await request(app)
      .get('/')
      .set('Origin', 'http://localhost:3000');
    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});

describe('E2E: Content-Type', () => {
  test('API endpoints return application/json', async () => {
    const endpoints = [
      '/',
      '/api/v1/health',
      '/api/v1/movies',
      '/swagger.json',
    ];

    for (const endpoint of endpoints) {
      const res = await request(app).get(endpoint);
      expect(res.headers['content-type']).toContain('application/json');
    }
  });
});
