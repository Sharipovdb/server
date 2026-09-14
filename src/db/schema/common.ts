import { sql } from 'drizzle-orm';
import { bigint, boolean, date, numeric, pgSchema, timestamp } from 'drizzle-orm/pg-core';

export const transportation = pgSchema('transportation');

export function identityPrimaryKey() {
  return bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity();
}

export function referenceId(name: string) {
  return bigint(name, { mode: 'number' });
}

export function timestampColumn(name: string) {
  return timestamp(name, { withTimezone: true, mode: 'string' });
}

export function dateColumn(name: string) {
  return date(name, { mode: 'string' });
}

export function moneyColumn(name: string) {
  return numeric(name, { precision: 18, scale: 2 });
}

export const baseEntityColumns = {
  id: identityPrimaryKey(),
  createdAt: timestampColumn('CreatedAt').notNull(),
  updatedAt: timestampColumn('UpdatedAt'),
  isDeleted: boolean('IsDeleted').notNull().default(false),
};

export const onlyNotDeletedRows = sql`"IsDeleted" = false`;
