import { env } from '../config/env.js';
import type { OpenAPIV3 } from 'openapi-types';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'MassTamilan Express API (Unofficial)',
    version: '1.0.0',
    description:
      'Unofficial API wrapper for masstamilan.dev. Endpoints are scrape-backed and may change if source markup changes.',
  },
  servers: [
    {
      url: `http://localhost:${env.port}`,
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Movies' },
    { name: 'Songs' },
    { name: 'Search' },
    { name: 'Download' },
  ],
  paths: {
    '/api/v1/health': {
      get: {
        tags: ['Health'],
        summary: 'Service health and metadata',
        responses: {
          200: {
            description: 'Service metadata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/movies': {
      get: {
        tags: ['Movies'],
        summary: 'List movies/albums from supported sources',
        parameters: [
          {
            in: 'query',
            name: 'source',
            schema: {
              type: 'string',
              enum: ['tamil-songs', 'latest-updates', 'tag', 'year', 'music', 'search'],
              default: 'tamil-songs',
            },
          },
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            in: 'query',
            name: 'letter',
            schema: { type: 'string' },
            description: 'Required when source=tag',
          },
          {
            in: 'query',
            name: 'year',
            schema: { type: 'integer' },
            description: 'Required when source=year',
          },
          {
            in: 'query',
            name: 'music',
            schema: { type: 'string' },
            description: 'Required when source=music (music-director slug)',
          },
          {
            in: 'query',
            name: 'keyword',
            schema: { type: 'string' },
            description: 'Required when source=search',
          },
        ],
        responses: {
          200: {
            description: 'Movies list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MovieListResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/movies/{slug}': {
      get: {
        tags: ['Movies'],
        summary: 'Get album/movie details by slug',
        parameters: [
          {
            in: 'path',
            name: 'slug',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Album details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AlbumResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/movies/{slug}/songs': {
      get: {
        tags: ['Songs'],
        summary: 'Get songs by album/movie slug',
        parameters: [
          {
            in: 'path',
            name: 'slug',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Songs list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SongListResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/songs/{movieId}/{songSlug}': {
      get: {
        tags: ['Songs'],
        summary: 'Get song page details by movieId and songSlug',
        parameters: [
          {
            in: 'path',
            name: 'movieId',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
          {
            in: 'path',
            name: 'songSlug',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: {
            description: 'Song details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SongDetailsResponse' },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/search/autocomplete': {
      get: {
        tags: ['Search'],
        summary: 'Autocomplete search results',
        parameters: [
          {
            in: 'query',
            name: 'keyword',
            required: true,
            schema: { type: 'string', minLength: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Autocomplete list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AutocompleteResponse' },
              },
            },
          },
        },
      },
    },
    '/api/v1/download/resolve': {
      get: {
        tags: ['Download'],
        summary: 'Resolve downloader URL to redirect target',
        parameters: [
          {
            in: 'query',
            name: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Relative /downloader/... path or full URL',
          },
        ],
        responses: {
          200: {
            description: 'Resolved redirect metadata',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResolveDownloadResponse' },
              },
            },
          },
        },
      },
    },
    '/swagger.json': {
      get: {
        tags: ['Health'],
        summary: 'Raw OpenAPI JSON document',
        responses: {
          200: {
            description: 'OpenAPI specification',
          },
        },
      },
    },
    '/docs': {
      get: {
        tags: ['Health'],
        summary: 'Swagger UI',
        responses: {
          200: {
            description: 'Swagger UI HTML',
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ApiEnvelope: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
        },
        required: ['success'],
      },
      ErrorResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  details: {},
                  requestId: { type: 'string' },
                },
                required: ['message'],
              },
            },
            required: ['error'],
          },
        ],
      },
      MovieItem: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          slug: { type: 'string' },
          path: { type: 'string' },
          url: { type: 'string' },
        },
      },
      SongItem: {
        type: 'object',
        properties: {
          movieId: { type: 'integer', nullable: true },
          songId: { type: 'integer', nullable: true },
          songSlug: { type: 'string', nullable: true },
          title: { type: 'string', nullable: true },
          artists: { type: 'string', nullable: true },
          movieTitle: { type: 'string', nullable: true },
          imageName: { type: 'string', nullable: true },
          songPagePath: { type: 'string', nullable: true },
          songPageUrl: { type: 'string', nullable: true },
          playerDownloadPath: { type: 'string', nullable: true },
          download128Path: { type: 'string', nullable: true },
          download320Path: { type: 'string', nullable: true },
          download128Url: { type: 'string', nullable: true },
          download320Url: { type: 'string', nullable: true },
        },
      },
      HealthResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  version: { type: 'string' },
                  uptimeSeconds: { type: 'number' },
                  timestamp: { type: 'string' },
                },
              },
            },
          },
        ],
      },
      MovieListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  source: { type: 'string' },
                  page: { type: 'integer' },
                  count: { type: 'integer' },
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MovieItem' },
                  },
                },
              },
            },
          },
        ],
      },
      AlbumResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  movieId: { type: 'integer', nullable: true },
                  songs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SongItem' },
                  },
                  zip128Path: { type: 'string', nullable: true },
                  zip320Path: { type: 'string', nullable: true },
                  zip128Url: { type: 'string', nullable: true },
                  zip320Url: { type: 'string', nullable: true },
                },
              },
            },
          },
        ],
      },
      SongListResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  slug: { type: 'string' },
                  movieId: { type: 'integer', nullable: true },
                  title: { type: 'string' },
                  count: { type: 'integer' },
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SongItem' },
                  },
                },
              },
            },
          },
        ],
      },
      SongDetailsResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  slug: { type: 'string' },
                  movieId: { type: 'integer', nullable: true },
                  songs: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/SongItem' },
                  },
                  currentSong: {
                    oneOf: [
                      { $ref: '#/components/schemas/SongItem' },
                      { type: 'string', nullable: true },
                    ],
                  },
                  zip128Path: { type: 'string', nullable: true },
                  zip320Path: { type: 'string', nullable: true },
                  zip128Url: { type: 'string', nullable: true },
                  zip320Url: { type: 'string', nullable: true },
                },
              },
            },
          },
        ],
      },
      AutocompleteItem: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          subtitle: { type: 'string' },
          slug: { type: 'string' },
          path: { type: 'string' },
          url: { type: 'string' },
        },
      },
      AutocompleteResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  count: { type: 'integer' },
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AutocompleteItem' },
                  },
                },
              },
            },
          },
        ],
      },
      ResolveDownloadResponse: {
        allOf: [
          { $ref: '#/components/schemas/ApiEnvelope' },
          {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  location: { type: 'string', nullable: true },
                  status: { type: 'integer' },
                },
              },
            },
          },
        ],
      },
    },
  },
};
