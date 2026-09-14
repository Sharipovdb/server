import { relations } from 'drizzle-orm';
import { absenceNotices } from './absence-notices.ts';
import { crewMemberships, crews } from './crews.ts';
import { roles, userRoles, users } from './identity.ts';
import { monthlyTransportSheetDays, monthlyTransportSheets } from './monthly-transport-sheets.ts';
import { routes } from './routes.ts';
import { tariffs } from './tariffs.ts';
import { taxiExpenses, transportDays } from './transport-days.ts';
import { vehicles } from './vehicles.ts';

export const usersRelations = relations(users, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  driver: one(users, { fields: [vehicles.driverId], references: [users.id] }),
}));

export const crewsRelations = relations(crews, ({ one }) => ({
  route: one(routes, { fields: [crews.routeId], references: [routes.id] }),
  tariff: one(tariffs, { fields: [crews.tariffId], references: [tariffs.id] }),
  crewLead: one(users, { fields: [crews.crewLeadId], references: [users.id] }),
  driverLead: one(users, { fields: [crews.driverLeadId], references: [users.id] }),
}));

export const crewMembershipsRelations = relations(crewMemberships, ({ one }) => ({
  crew: one(crews, { fields: [crewMemberships.crewId], references: [crews.id] }),
  user: one(users, { fields: [crewMemberships.userId], references: [users.id] }),
}));

export const absenceNoticesRelations = relations(absenceNotices, ({ one }) => ({
  user: one(users, { fields: [absenceNotices.userId], references: [users.id] }),
}));

export const transportDaysRelations = relations(transportDays, ({ one, many }) => ({
  crew: one(crews, { fields: [transportDays.crewId], references: [crews.id] }),
  driver: one(users, { fields: [transportDays.driverId], references: [users.id] }),
  loggedByUser: one(users, { fields: [transportDays.loggedBy], references: [users.id] }),
  taxiExpenses: many(taxiExpenses),
}));

export const taxiExpensesRelations = relations(taxiExpenses, ({ one }) => ({
  transportDay: one(transportDays, {
    fields: [taxiExpenses.transportDayId],
    references: [transportDays.id],
  }),
  paidBy: one(users, { fields: [taxiExpenses.paidById], references: [users.id] }),
}));

export const monthlyTransportSheetsRelations = relations(
  monthlyTransportSheets,
  ({ one, many }) => ({
    crew: one(crews, { fields: [monthlyTransportSheets.crewId], references: [crews.id] }),
    recipient: one(users, {
      fields: [monthlyTransportSheets.recipientId],
      references: [users.id],
    }),
    createdBy: one(users, {
      fields: [monthlyTransportSheets.createdById],
      references: [users.id],
    }),
    paidBy: one(users, { fields: [monthlyTransportSheets.paidById], references: [users.id] }),
    days: many(monthlyTransportSheetDays),
  }),
);

export const monthlyTransportSheetDaysRelations = relations(
  monthlyTransportSheetDays,
  ({ one }) => ({
    monthlyTransportSheet: one(monthlyTransportSheets, {
      fields: [monthlyTransportSheetDays.monthlyTransportSheetId],
      references: [monthlyTransportSheets.id],
    }),
    transportDay: one(transportDays, {
      fields: [monthlyTransportSheetDays.transportDayId],
      references: [transportDays.id],
    }),
  }),
);
