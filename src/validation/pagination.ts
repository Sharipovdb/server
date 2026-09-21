import { z } from 'zod';

export const paginationQuerySchema = z
  .object({
    'PaginationInfo.Index': z.coerce.number().int().nonnegative(),
    'PaginationInfo.Size': z.coerce.number().int().positive(),
  })
  .transform((query) => ({
    index: query['PaginationInfo.Index'],
    size: query['PaginationInfo.Size'],
  }));

export type Pagination = z.infer<typeof paginationQuerySchema>;
