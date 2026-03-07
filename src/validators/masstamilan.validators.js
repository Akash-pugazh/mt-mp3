const { z } = require('zod');

const movieListQuerySchema = z
  .object({
    source: z
      .enum(['tamil-songs', 'latest-updates', 'tag', 'year', 'music', 'search'])
      .default('tamil-songs'),
    page: z.coerce.number().int().positive().max(200).default(1),
    letter: z.string().min(1).max(3).optional(),
    year: z.coerce.number().int().min(1950).max(2100).optional(),
    music: z.string().min(1).max(100).optional(),
    keyword: z.string().min(1).max(100).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.source === 'tag' && !value.letter) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['letter'], message: 'letter is required' });
    }

    if (value.source === 'year' && !value.year) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['year'], message: 'year is required' });
    }

    if (value.source === 'music' && !value.music) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['music'], message: 'music is required' });
    }

    if (value.source === 'search' && !value.keyword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['keyword'],
        message: 'keyword is required',
      });
    }
  });

const slugParamSchema = z.object({
  slug: z.string().min(1).max(200),
});

const songParamSchema = z.object({
  movieId: z.coerce.number().int().positive(),
  songSlug: z.string().min(1).max(300),
});

const autocompleteQuerySchema = z.object({
  keyword: z.string().min(1).max(100),
});

const resolveDownloadQuerySchema = z.object({
  path: z.string().min(1),
});

module.exports = {
  movieListQuerySchema,
  slugParamSchema,
  songParamSchema,
  autocompleteQuerySchema,
  resolveDownloadQuerySchema,
};
