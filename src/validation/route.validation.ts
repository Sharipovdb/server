import { z } from 'zod';

export const createRouteSchema = z.object({
  name: z.string().min(3).max(50),
  distanceKm: z.number(),
});
export const updateRouteSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(3).max(50),
  distanceKm: z.number(),
});

export type CreateRoute = z.infer<typeof createRouteSchema>;
export type UpdateRoute = z.infer<typeof updateRouteSchema>;
