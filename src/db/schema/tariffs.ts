import { uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import { baseEntityColumns, moneyColumn, onlyNotDeletedRows, transportation } from './common.ts';

export const tariffs = transportation.table(
  'tariffs',
  {
    ...baseEntityColumns,
    name: varchar('Name', { length: 50 }).notNull(),
    amountPerLeg: moneyColumn('AmountPerLeg').notNull(),
  },
  (table) => [uniqueIndex('IX_tariffs_Name').on(table.name).where(onlyNotDeletedRows)],
);
