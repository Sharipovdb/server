import { z } from 'zod';

export const createTariffSchema = z.object({
  name: z.string().min(1).max(50),
  amountPerLeg: z.number().refine((val) => val !== 0),
});
export const updateTariffSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(50),
  amountPerLeg: z.number().refine((val) => val !== 0),
});

export type CreateTariff = z.infer<typeof createTariffSchema>;
export type UpdateTariff = z.infer<typeof updateTariffSchema>;
