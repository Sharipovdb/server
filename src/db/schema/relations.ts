import { relations } from 'drizzle-orm/relations';
import {
  aspNetRolesInTransportation,
  aspNetRoleClaimsInTransportation,
  aspNetUsersInTransportation,
  absenceNoticesInTransportation,
  aspNetUserClaimsInTransportation,
  vehiclesInTransportation,
  crewMembershipsInTransportation,
  crewsInTransportation,
  transportDaysInTransportation,
  taxiExpenseInTransportation,
  monthlyTransportSheetsInTransportation,
  routesInTransportation,
  tariffsInTransportation,
  monthlyTransportSheetDaysInTransportation,
  aspNetUserRolesInTransportation,
  aspNetUserLoginsInTransportation,
  aspNetUserTokensInTransportation,
} from './schema.ts';

export const aspNetRoleClaimsInTransportationRelations = relations(
  aspNetRoleClaimsInTransportation,
  ({ one }) => ({
    aspNetRolesInTransportation: one(aspNetRolesInTransportation, {
      fields: [aspNetRoleClaimsInTransportation.roleId],
      references: [aspNetRolesInTransportation.id],
    }),
  }),
);

export const aspNetRolesInTransportationRelations = relations(
  aspNetRolesInTransportation,
  ({ many }) => ({
    aspNetRoleClaimsInTransportations: many(aspNetRoleClaimsInTransportation),
    aspNetUserRolesInTransportations: many(aspNetUserRolesInTransportation),
  }),
);

export const absenceNoticesInTransportationRelations = relations(
  absenceNoticesInTransportation,
  ({ one }) => ({
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [absenceNoticesInTransportation.userId],
      references: [aspNetUsersInTransportation.id],
    }),
  }),
);

export const aspNetUsersInTransportationRelations = relations(
  aspNetUsersInTransportation,
  ({ many }) => ({
    absenceNoticesInTransportations: many(absenceNoticesInTransportation),
    aspNetUserClaimsInTransportations: many(aspNetUserClaimsInTransportation),
    vehiclesInTransportations: many(vehiclesInTransportation),
    crewMembershipsInTransportations: many(crewMembershipsInTransportation),
    transportDaysInTransportations_driverId: many(transportDaysInTransportation, {
      relationName: 'transportDaysInTransportation_driverId_aspNetUsersInTransportation_id',
    }),
    transportDaysInTransportations_loggedBy: many(transportDaysInTransportation, {
      relationName: 'transportDaysInTransportation_loggedBy_aspNetUsersInTransportation_id',
    }),
    taxiExpenseInTransportations: many(taxiExpenseInTransportation),
    monthlyTransportSheetsInTransportations_createdById: many(
      monthlyTransportSheetsInTransportation,
      {
        relationName:
          'monthlyTransportSheetsInTransportation_createdById_aspNetUsersInTransportation_id',
      },
    ),
    monthlyTransportSheetsInTransportations_paidById: many(monthlyTransportSheetsInTransportation, {
      relationName:
        'monthlyTransportSheetsInTransportation_paidById_aspNetUsersInTransportation_id',
    }),
    monthlyTransportSheetsInTransportations_recipientId: many(
      monthlyTransportSheetsInTransportation,
      {
        relationName:
          'monthlyTransportSheetsInTransportation_recipientId_aspNetUsersInTransportation_id',
      },
    ),
    crewsInTransportations_crewLeadId: many(crewsInTransportation, {
      relationName: 'crewsInTransportation_crewLeadId_aspNetUsersInTransportation_id',
    }),
    crewsInTransportations_driverLeadId: many(crewsInTransportation, {
      relationName: 'crewsInTransportation_driverLeadId_aspNetUsersInTransportation_id',
    }),
    aspNetUserRolesInTransportations: many(aspNetUserRolesInTransportation),
    aspNetUserLoginsInTransportations: many(aspNetUserLoginsInTransportation),
    aspNetUserTokensInTransportations: many(aspNetUserTokensInTransportation),
  }),
);

export const aspNetUserClaimsInTransportationRelations = relations(
  aspNetUserClaimsInTransportation,
  ({ one }) => ({
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [aspNetUserClaimsInTransportation.userId],
      references: [aspNetUsersInTransportation.id],
    }),
  }),
);

export const vehiclesInTransportationRelations = relations(vehiclesInTransportation, ({ one }) => ({
  aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
    fields: [vehiclesInTransportation.driverId],
    references: [aspNetUsersInTransportation.id],
  }),
}));

export const crewMembershipsInTransportationRelations = relations(
  crewMembershipsInTransportation,
  ({ one }) => ({
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [crewMembershipsInTransportation.userId],
      references: [aspNetUsersInTransportation.id],
    }),
    crewsInTransportation: one(crewsInTransportation, {
      fields: [crewMembershipsInTransportation.crewId],
      references: [crewsInTransportation.id],
    }),
  }),
);

export const crewsInTransportationRelations = relations(crewsInTransportation, ({ one, many }) => ({
  crewMembershipsInTransportations: many(crewMembershipsInTransportation),
  transportDaysInTransportations: many(transportDaysInTransportation),
  monthlyTransportSheetsInTransportations: many(monthlyTransportSheetsInTransportation),
  aspNetUsersInTransportation_crewLeadId: one(aspNetUsersInTransportation, {
    fields: [crewsInTransportation.crewLeadId],
    references: [aspNetUsersInTransportation.id],
    relationName: 'crewsInTransportation_crewLeadId_aspNetUsersInTransportation_id',
  }),
  aspNetUsersInTransportation_driverLeadId: one(aspNetUsersInTransportation, {
    fields: [crewsInTransportation.driverLeadId],
    references: [aspNetUsersInTransportation.id],
    relationName: 'crewsInTransportation_driverLeadId_aspNetUsersInTransportation_id',
  }),
  routesInTransportation: one(routesInTransportation, {
    fields: [crewsInTransportation.routeId],
    references: [routesInTransportation.id],
  }),
  tariffsInTransportation: one(tariffsInTransportation, {
    fields: [crewsInTransportation.tariffId],
    references: [tariffsInTransportation.id],
  }),
}));

export const transportDaysInTransportationRelations = relations(
  transportDaysInTransportation,
  ({ one, many }) => ({
    aspNetUsersInTransportation_driverId: one(aspNetUsersInTransportation, {
      fields: [transportDaysInTransportation.driverId],
      references: [aspNetUsersInTransportation.id],
      relationName: 'transportDaysInTransportation_driverId_aspNetUsersInTransportation_id',
    }),
    aspNetUsersInTransportation_loggedBy: one(aspNetUsersInTransportation, {
      fields: [transportDaysInTransportation.loggedBy],
      references: [aspNetUsersInTransportation.id],
      relationName: 'transportDaysInTransportation_loggedBy_aspNetUsersInTransportation_id',
    }),
    crewsInTransportation: one(crewsInTransportation, {
      fields: [transportDaysInTransportation.crewId],
      references: [crewsInTransportation.id],
    }),
    taxiExpenseInTransportations: many(taxiExpenseInTransportation),
    monthlyTransportSheetDaysInTransportations: many(monthlyTransportSheetDaysInTransportation),
  }),
);

export const taxiExpenseInTransportationRelations = relations(
  taxiExpenseInTransportation,
  ({ one }) => ({
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [taxiExpenseInTransportation.paidById],
      references: [aspNetUsersInTransportation.id],
    }),
    transportDaysInTransportation: one(transportDaysInTransportation, {
      fields: [taxiExpenseInTransportation.transportDayId],
      references: [transportDaysInTransportation.id],
    }),
  }),
);

export const monthlyTransportSheetsInTransportationRelations = relations(
  monthlyTransportSheetsInTransportation,
  ({ one, many }) => ({
    aspNetUsersInTransportation_createdById: one(aspNetUsersInTransportation, {
      fields: [monthlyTransportSheetsInTransportation.createdById],
      references: [aspNetUsersInTransportation.id],
      relationName:
        'monthlyTransportSheetsInTransportation_createdById_aspNetUsersInTransportation_id',
    }),
    aspNetUsersInTransportation_paidById: one(aspNetUsersInTransportation, {
      fields: [monthlyTransportSheetsInTransportation.paidById],
      references: [aspNetUsersInTransportation.id],
      relationName:
        'monthlyTransportSheetsInTransportation_paidById_aspNetUsersInTransportation_id',
    }),
    aspNetUsersInTransportation_recipientId: one(aspNetUsersInTransportation, {
      fields: [monthlyTransportSheetsInTransportation.recipientId],
      references: [aspNetUsersInTransportation.id],
      relationName:
        'monthlyTransportSheetsInTransportation_recipientId_aspNetUsersInTransportation_id',
    }),
    crewsInTransportation: one(crewsInTransportation, {
      fields: [monthlyTransportSheetsInTransportation.crewId],
      references: [crewsInTransportation.id],
    }),
    monthlyTransportSheetDaysInTransportations: many(monthlyTransportSheetDaysInTransportation),
  }),
);

export const routesInTransportationRelations = relations(routesInTransportation, ({ many }) => ({
  crewsInTransportations: many(crewsInTransportation),
}));

export const tariffsInTransportationRelations = relations(tariffsInTransportation, ({ many }) => ({
  crewsInTransportations: many(crewsInTransportation),
}));

export const monthlyTransportSheetDaysInTransportationRelations = relations(
  monthlyTransportSheetDaysInTransportation,
  ({ one }) => ({
    monthlyTransportSheetsInTransportation: one(monthlyTransportSheetsInTransportation, {
      fields: [monthlyTransportSheetDaysInTransportation.monthlyTransportSheetId],
      references: [monthlyTransportSheetsInTransportation.id],
    }),
    transportDaysInTransportation: one(transportDaysInTransportation, {
      fields: [monthlyTransportSheetDaysInTransportation.transportDayId],
      references: [transportDaysInTransportation.id],
    }),
  }),
);

export const aspNetUserRolesInTransportationRelations = relations(
  aspNetUserRolesInTransportation,
  ({ one }) => ({
    aspNetRolesInTransportation: one(aspNetRolesInTransportation, {
      fields: [aspNetUserRolesInTransportation.roleId],
      references: [aspNetRolesInTransportation.id],
    }),
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [aspNetUserRolesInTransportation.userId],
      references: [aspNetUsersInTransportation.id],
    }),
  }),
);

export const aspNetUserLoginsInTransportationRelations = relations(
  aspNetUserLoginsInTransportation,
  ({ one }) => ({
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [aspNetUserLoginsInTransportation.userId],
      references: [aspNetUsersInTransportation.id],
    }),
  }),
);

export const aspNetUserTokensInTransportationRelations = relations(
  aspNetUserTokensInTransportation,
  ({ one }) => ({
    aspNetUsersInTransportation: one(aspNetUsersInTransportation, {
      fields: [aspNetUserTokensInTransportation.userId],
      references: [aspNetUsersInTransportation.id],
    }),
  }),
);
