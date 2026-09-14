import { numeric } from 'drizzle-orm/pg-core';
import { baseEntityColumns, timestampColumn, transportation } from './common.ts';

export const transportSettings = transportation.table('TransportSettings', {
  ...baseEntityColumns,
  commuteKmRate: numeric('CommuteKmRate').notNull(),
  extraBusinessKmRate: numeric('ExtraBusinessKmRate').notNull(),
  effectiveFrom: timestampColumn('EffectiveFrom').notNull(),
});
