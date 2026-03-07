import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { z } from 'zod';

type RequestSource = 'query' | 'params' | 'body';

export function validate(schema: ZodSchema, source: RequestSource = 'query') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const parsed = schema.parse(req[source]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = parsed;
    next();
  };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(200).default(1),
});
