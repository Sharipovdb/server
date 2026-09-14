import { doublePrecision, index, integer, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import type { Leg, TaxiExpenseStatus, TransportMode } from '../enums.ts';
import {
  baseEntityColumns,
  dateColumn,
  moneyColumn,
  onlyNotDeletedRows,
  referenceId,
  timestampColumn,
  transportation,
} from './common.ts';
import { crews } from './crews.ts';
import { users } from './identity.ts';

export const transportDays = transportation.table(
  'transport_days',
  {
    ...baseEntityColumns,
    crewId: referenceId('CrewId')
      .notNull()
      .references(() => crews.id, { onDelete: 'cascade' }),
    date: dateColumn('Date').notNull(),
    morningMode: integer('MorningMode').$type<TransportMode>().notNull(),
    afternoonMode: integer('AfternoonMode').$type<TransportMode>(),
    baseRouteKm: doublePrecision('BaseRouteKm').notNull(),
    extraCommuteKm: doublePrecision('ExtraCommuteKm').notNull(),
    extraBusinessKm: doublePrecision('ExtraBusinessKm').notNull(),
    driverId: referenceId('DriverId').references(() => users.id),
    loggedBy: referenceId('LoggedBy')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    loggedAt: timestampColumn('LoggedAt').notNull(),
    notes: varchar('Notes', { length: 500 }).notNull(),
  },
  (table) => [
    uniqueIndex('IX_transport_days_CrewId_Date')
      .on(table.crewId, table.date)
      .where(onlyNotDeletedRows),
    index('IX_transport_days_DriverId').on(table.driverId),
    index('IX_transport_days_LoggedBy').on(table.loggedBy),
  ],
);

export const taxiExpenses = transportation.table(
  'TaxiExpense',
  {
    ...baseEntityColumns,
    transportDayId: referenceId('TransportDayId')
      .notNull()
      .references(() => transportDays.id, { onDelete: 'cascade' }),
    leg: integer('Leg').$type<Leg>().notNull(),
    amount: moneyColumn('Amount').notNull(),
    paidById: referenceId('PaidById')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    taxiExpenseStatus: integer('TaxiExpenseStatus').$type<TaxiExpenseStatus>().notNull(),
  },
  (table) => [
    uniqueIndex('IX_TaxiExpense_TransportDayId_Leg_PaidById')
      .on(table.transportDayId, table.leg, table.paidById)
      .where(onlyNotDeletedRows),
    index('IX_TaxiExpense_TransportDayId').on(table.transportDayId),
    index('IX_TaxiExpense_PaidById').on(table.paidById),
  ],
);
