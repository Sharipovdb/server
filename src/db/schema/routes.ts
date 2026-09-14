import { doublePrecision, varchar } from 'drizzle-orm/pg-core';
import { baseEntityColumns, transportation } from './common.ts';

export const routes = transportation.table('Routes', {
  ...baseEntityColumns,
  name: varchar('Name', { length: 50 }).notNull(),
  distanceKm: doublePrecision('DistanceKm').notNull(),
});
