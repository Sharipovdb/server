import {
  boolean,
  doublePrecision,
  index,
  integer,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
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
import { transportDays } from './transport-days.ts';

export const monthlyTransportSheets = transportation.table(
  'monthly_transport_sheets',
  {
    ...baseEntityColumns,
    crewId: referenceId('CrewId')
      .notNull()
      .references(() => crews.id, { onDelete: 'restrict' }),
    year: integer('Year').notNull(),
    month: integer('Month').notNull(),
    periodStart: dateColumn('PeriodStart').notNull(),
    periodEnd: dateColumn('PeriodEnd').notNull(),
    recipientId: referenceId('RecipientId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    kmRate: numeric('KmRate', { precision: 18, scale: 4 }).notNull().default('0'),
    tariffPerLeg: moneyColumn('TariffPerLeg').notNull().default('0'),
    amortizationAmount: moneyColumn('AmortizationAmount').notNull().default('0'),
    createdById: referenceId('CreatedById')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    isConfirmed: boolean('IsConfirmed').notNull().default(false),
    confirmedById: referenceId('ConfirmedById'),
    confirmedAt: timestampColumn('ConfirmedAt'),
    isPaid: boolean('IsPaid').notNull().default(false),
    paidById: referenceId('PaidById').references(() => users.id, { onDelete: 'restrict' }),
    paidAt: timestampColumn('PaidAt'),
  },
  (table) => [
    uniqueIndex('IX_monthly_transport_sheets_CrewId_Year_Month')
      .on(table.crewId, table.year, table.month)
      .where(onlyNotDeletedRows),
    index('IX_monthly_transport_sheets_RecipientId').on(table.recipientId),
    index('IX_monthly_transport_sheets_CreatedById').on(table.createdById),
    index('IX_monthly_transport_sheets_PaidById').on(table.paidById),
  ],
);

export const monthlyTransportSheetDays = transportation.table(
  'monthly_transport_sheet_days',
  {
    ...baseEntityColumns,
    monthlyTransportSheetId: referenceId('MonthlyTransportSheetId')
      .notNull()
      .references(() => monthlyTransportSheets.id, { onDelete: 'cascade' }),
    transportDayId: referenceId('TransportDayId')
      .notNull()
      .references(() => transportDays.id, { onDelete: 'restrict' }),
    date: dateColumn('Date').notNull(),
    drivenLegCount: integer('DrivenLegCount').notNull(),
    drivenKm: doublePrecision('DrivenKm').notNull(),
    extraBusinessKm: doublePrecision('ExtraBusinessKm').notNull(),
    taxiAmount: moneyColumn('TaxiAmount').notNull(),
  },
  (table) => [
    uniqueIndex('IX_monthly_transport_sheet_days_SheetId_TransportDayId').on(
      table.monthlyTransportSheetId,
      table.transportDayId,
    ),
    index('IX_monthly_transport_sheet_days_TransportDayId').on(table.transportDayId),
  ],
);
