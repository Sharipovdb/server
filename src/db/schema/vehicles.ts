import { index, integer, text, uniqueIndex } from 'drizzle-orm/pg-core';
import {
  baseEntityColumns,
  moneyColumn,
  onlyNotDeletedRows,
  referenceId,
  transportation,
} from './common.ts';
import { users } from './identity.ts';

export const vehicles = transportation.table(
  'vehicles',
  {
    ...baseEntityColumns,
    driverId: referenceId('DriverId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    plate: text('Plate').notNull(),
    seatCount: integer('SeatCount').notNull(),
    amortizationBasis: moneyColumn('AmortizationBasis').notNull(),
  },
  (table) => [
    uniqueIndex('IX_vehicles_Plate').on(table.plate).where(onlyNotDeletedRows),
    index('IX_vehicles_DriverId').on(table.driverId),
  ],
);
