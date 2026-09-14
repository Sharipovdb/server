import { boolean, index, integer, uniqueIndex, varchar } from 'drizzle-orm/pg-core';
import {
  baseEntityColumns,
  onlyNotDeletedRows,
  referenceId,
  timestampColumn,
  transportation,
} from './common.ts';
import { users } from './identity.ts';
import { routes } from './routes.ts';
import { tariffs } from './tariffs.ts';

export const crews = transportation.table(
  'Crews',
  {
    ...baseEntityColumns,
    name: varchar('Name', { length: 30 }).notNull(),
    seatCapacity: integer('SeatCapacity').notNull(),
    routeId: referenceId('RouteId').references(() => routes.id, { onDelete: 'restrict' }),
    tariffId: referenceId('TariffId').references(() => tariffs.id, { onDelete: 'restrict' }),
    crewLeadId: referenceId('CrewLeadId').references(() => users.id),
    driverLeadId: referenceId('DriverLeadId').references(() => users.id),
  },
  (table) => [
    uniqueIndex('IX_Crews_Name').on(table.name).where(onlyNotDeletedRows),
    index('IX_Crews_RouteId').on(table.routeId),
    index('IX_Crews_TariffId').on(table.tariffId),
    index('IX_Crews_CrewLeadId').on(table.crewLeadId),
    index('IX_Crews_DriverLeadId').on(table.driverLeadId),
  ],
);

export const crewMemberships = transportation.table(
  'CrewMemberships',
  {
    ...baseEntityColumns,
    crewId: referenceId('CrewId')
      .notNull()
      .references(() => crews.id, { onDelete: 'cascade' }),
    userId: referenceId('UserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    activeFrom: timestampColumn('ActiveFrom').notNull(),
    activeTo: timestampColumn('ActiveTo'),
    isActive: boolean('IsActive').notNull(),
  },
  (table) => [
    index('IX_CrewMemberships_CrewId').on(table.crewId),
    index('IX_CrewMemberships_UserId').on(table.userId),
  ],
);
