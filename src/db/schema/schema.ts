import {
  pgSchema,
  bigint,
  numeric,
  timestamp,
  boolean,
  uniqueIndex,
  varchar,
  text,
  index,
  foreignKey,
  integer,
  date,
  doublePrecision,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const transportation = pgSchema('transportation');

export const aspNetRolesIdSeqInTransportation = transportation.sequence('AspNetRoles_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const aspNetUsersIdSeqInTransportation = transportation.sequence('AspNetUsers_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const routesIdSeqInTransportation = transportation.sequence('Routes_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const transportSettingsIdSeqInTransportation = transportation.sequence(
  'TransportSettings_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '9223372036854775807',
    cache: '1',
    cycle: false,
  },
);
export const aspNetRoleClaimsIdSeqInTransportation = transportation.sequence(
  'AspNetRoleClaims_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '2147483647',
    cache: '1',
    cycle: false,
  },
);
export const absenceNoticesIdSeqInTransportation = transportation.sequence(
  'absence_notices_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '9223372036854775807',
    cache: '1',
    cycle: false,
  },
);
export const aspNetUserClaimsIdSeqInTransportation = transportation.sequence(
  'AspNetUserClaims_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '2147483647',
    cache: '1',
    cycle: false,
  },
);
export const vehiclesIdSeqInTransportation = transportation.sequence('vehicles_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const crewsIdSeqInTransportation = transportation.sequence('Crews_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const crewMembershipsIdSeqInTransportation = transportation.sequence(
  'CrewMemberships_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '9223372036854775807',
    cache: '1',
    cycle: false,
  },
);
export const monthlyTransportSheetsIdSeqInTransportation = transportation.sequence(
  'MonthlyTransportSheets_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '9223372036854775807',
    cache: '1',
    cycle: false,
  },
);
export const transportDaysIdSeqInTransportation = transportation.sequence('transport_days_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const taxiExpenseIdSeqInTransportation = transportation.sequence('TaxiExpense_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});
export const monthlyTransportSheetDaysIdSeqInTransportation = transportation.sequence(
  'monthly_transport_sheet_days_Id_seq',
  {
    startWith: '1',
    increment: '1',
    minValue: '1',
    maxValue: '9223372036854775807',
    cache: '1',
    cycle: false,
  },
);
export const tariffsIdSeqInTransportation = transportation.sequence('tariffs_Id_seq', {
  startWith: '1',
  increment: '1',
  minValue: '1',
  maxValue: '9223372036854775807',
  cache: '1',
  cycle: false,
});

export const transportSettingsInTransportation = transportation.table('TransportSettings', {
  id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
    name: 'TransportSettings_Id_seq',
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: '9223372036854775807',
  }),
  commuteKmRate: numeric('CommuteKmRate').notNull(),
  extraBusinessKmRate: numeric('ExtraBusinessKmRate').notNull(),
  effectiveFrom: timestamp('EffectiveFrom', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
  isDeleted: boolean('IsDeleted').notNull(),
});

export const aspNetRolesInTransportation = transportation.table(
  'AspNetRoles',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'AspNetRoles_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    name: varchar('Name', { length: 256 }),
    normalizedName: varchar('NormalizedName', { length: 256 }),
    concurrencyStamp: text('ConcurrencyStamp'),
  },
  (table) => [
    uniqueIndex('RoleNameIndex').using(
      'btree',
      table.normalizedName.asc().nullsLast().op('text_ops'),
    ),
  ],
);

export const aspNetRoleClaimsInTransportation = transportation.table(
  'AspNetRoleClaims',
  {
    id: integer('Id').primaryKey().generatedByDefaultAsIdentity({
      name: 'AspNetRoleClaims_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    roleId: bigint('RoleId', { mode: 'number' }).notNull(),
    claimType: text('ClaimType'),
    claimValue: text('ClaimValue'),
  },
  (table) => [
    index('IX_AspNetRoleClaims_RoleId').using(
      'btree',
      table.roleId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [aspNetRolesInTransportation.id],
      name: 'FK_AspNetRoleClaims_AspNetRoles_RoleId',
    }).onDelete('cascade'),
  ],
);

export const aspNetUsersInTransportation = transportation.table(
  'AspNetUsers',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'AspNetUsers_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    firstName: text('FirstName').notNull(),
    lastName: text('LastName').notNull(),
    telegramId: text('TelegramId'),
    refreshToken: text('RefreshToken'),
    refreshTokenExpiryTime: timestamp('RefreshTokenExpiryTime', {
      withTimezone: true,
      mode: 'string',
    }),
    userName: varchar('UserName', { length: 256 }),
    normalizedUserName: varchar('NormalizedUserName', { length: 256 }),
    email: varchar('Email', { length: 256 }),
    normalizedEmail: varchar('NormalizedEmail', { length: 256 }),
    emailConfirmed: boolean('EmailConfirmed').notNull(),
    passwordHash: text('PasswordHash'),
    securityStamp: text('SecurityStamp'),
    concurrencyStamp: text('ConcurrencyStamp'),
    phoneNumber: text('PhoneNumber'),
    phoneNumberConfirmed: boolean('PhoneNumberConfirmed').notNull(),
    twoFactorEnabled: boolean('TwoFactorEnabled').notNull(),
    lockoutEnd: timestamp('LockoutEnd', { withTimezone: true, mode: 'string' }),
    lockoutEnabled: boolean('LockoutEnabled').notNull(),
    accessFailedCount: integer('AccessFailedCount').notNull(),
  },
  (table) => [
    index('EmailIndex').using('btree', table.normalizedEmail.asc().nullsLast().op('text_ops')),
    uniqueIndex('UserNameIndex').using(
      'btree',
      table.normalizedUserName.asc().nullsLast().op('text_ops'),
    ),
  ],
);

export const absenceNoticesInTransportation = transportation.table(
  'absence_notices',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'absence_notices_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    userId: bigint('UserId', { mode: 'number' }).notNull(),
    date: date('Date', { mode: 'string' }).notNull(),
    scope: integer('Scope').notNull(),
    type: integer('Type').notNull(),
    reason: varchar('Reason', { length: 500 }).notNull(),
    isNotified: boolean('IsNotified').default(false).notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
  },
  (table) => [
    index('IX_absence_notices_UserId').using(
      'btree',
      table.userId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_absence_notices_AspNetUsers_UserId',
    }).onDelete('cascade'),
  ],
);

export const aspNetUserClaimsInTransportation = transportation.table(
  'AspNetUserClaims',
  {
    id: integer('Id').primaryKey().generatedByDefaultAsIdentity({
      name: 'AspNetUserClaims_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: 2147483647,
    }),
    userId: bigint('UserId', { mode: 'number' }).notNull(),
    claimType: text('ClaimType'),
    claimValue: text('ClaimValue'),
  },
  (table) => [
    index('IX_AspNetUserClaims_UserId').using(
      'btree',
      table.userId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_AspNetUserClaims_AspNetUsers_UserId',
    }).onDelete('cascade'),
  ],
);

export const vehiclesInTransportation = transportation.table(
  'vehicles',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'vehicles_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    driverId: bigint('DriverId', { mode: 'number' }).notNull(),
    plate: text('Plate').notNull(),
    seatCount: integer('SeatCount').notNull(),
    amortizationBasis: numeric('AmortizationBasis', { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
  },
  (table) => [
    index('IX_vehicles_DriverId').using('btree', table.driverId.asc().nullsLast().op('int8_ops')),
    uniqueIndex('IX_vehicles_Plate')
      .using('btree', table.plate.asc().nullsLast().op('text_ops'))
      .where(sql`("IsDeleted" = false)`),
    foreignKey({
      columns: [table.driverId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_vehicles_AspNetUsers_DriverId',
    }).onDelete('restrict'),
  ],
);

export const routesInTransportation = transportation.table('Routes', {
  id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
    name: 'Routes_Id_seq',
    startWith: 1,
    increment: 1,
    minValue: 1,
    maxValue: '9223372036854775807',
  }),
  name: varchar('Name', { length: 50 }).notNull(),
  distanceKm: doublePrecision('DistanceKm').notNull(),
  createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
  isDeleted: boolean('IsDeleted').notNull(),
});

export const crewMembershipsInTransportation = transportation.table(
  'CrewMemberships',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'CrewMemberships_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    crewId: bigint('CrewId', { mode: 'number' }).notNull(),
    userId: bigint('UserId', { mode: 'number' }).notNull(),
    activeFrom: timestamp('ActiveFrom', { withTimezone: true, mode: 'string' }).notNull(),
    activeTo: timestamp('ActiveTo', { withTimezone: true, mode: 'string' }),
    isActive: boolean('IsActive').notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
  },
  (table) => [
    index('IX_CrewMemberships_CrewId').using(
      'btree',
      table.crewId.asc().nullsLast().op('int8_ops'),
    ),
    index('IX_CrewMemberships_UserId').using(
      'btree',
      table.userId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_CrewMemberships_AspNetUsers_UserId',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.crewId],
      foreignColumns: [crewsInTransportation.id],
      name: 'FK_CrewMemberships_Crews_CrewId',
    }).onDelete('cascade'),
  ],
);

export const transportDaysInTransportation = transportation.table(
  'transport_days',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'transport_days_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    crewId: bigint('CrewId', { mode: 'number' }).notNull(),
    date: date('Date', { mode: 'string' }).notNull(),
    morningMode: integer('MorningMode').notNull(),
    afternoonMode: integer('AfternoonMode'),
    baseRouteKm: doublePrecision('BaseRouteKm').notNull(),
    extraCommuteKm: doublePrecision('ExtraCommuteKm').notNull(),
    extraBusinessKm: doublePrecision('ExtraBusinessKm').notNull(),
    driverId: bigint('DriverId', { mode: 'number' }),
    notes: varchar('Notes', { length: 500 }).notNull(),
    loggedBy: bigint('LoggedBy', { mode: 'number' }).notNull(),
    loggedAt: timestamp('LoggedAt', { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
  },
  (table) => [
    uniqueIndex('IX_transport_days_CrewId_Date')
      .using(
        'btree',
        table.crewId.asc().nullsLast().op('int8_ops'),
        table.date.asc().nullsLast().op('date_ops'),
      )
      .where(sql`("IsDeleted" = false)`),
    index('IX_transport_days_DriverId').using(
      'btree',
      table.driverId.asc().nullsLast().op('int8_ops'),
    ),
    index('IX_transport_days_LoggedBy').using(
      'btree',
      table.loggedBy.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.driverId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_transport_days_AspNetUsers_DriverId',
    }),
    foreignKey({
      columns: [table.loggedBy],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_transport_days_AspNetUsers_LoggedBy',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.crewId],
      foreignColumns: [crewsInTransportation.id],
      name: 'FK_transport_days_Crews_CrewId',
    }).onDelete('cascade'),
  ],
);

export const taxiExpenseInTransportation = transportation.table(
  'TaxiExpense',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'TaxiExpense_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    transportDayId: bigint('TransportDayId', { mode: 'number' }).notNull(),
    leg: integer('Leg').notNull(),
    amount: numeric('Amount', { precision: 18, scale: 2 }).notNull(),
    paidById: bigint('PaidById', { mode: 'number' }).notNull(),
    taxiExpenseStatus: integer('TaxiExpenseStatus').notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
  },
  (table) => [
    index('IX_TaxiExpense_PaidById').using(
      'btree',
      table.paidById.asc().nullsLast().op('int8_ops'),
    ),
    index('IX_TaxiExpense_TransportDayId').using(
      'btree',
      table.transportDayId.asc().nullsLast().op('int8_ops'),
    ),
    uniqueIndex('IX_TaxiExpense_TransportDayId_Leg_PaidById')
      .using(
        'btree',
        table.transportDayId.asc().nullsLast().op('int8_ops'),
        table.leg.asc().nullsLast().op('int4_ops'),
        table.paidById.asc().nullsLast().op('int8_ops'),
      )
      .where(sql`("IsDeleted" = false)`),
    foreignKey({
      columns: [table.paidById],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_TaxiExpense_AspNetUsers_PaidById',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.transportDayId],
      foreignColumns: [transportDaysInTransportation.id],
      name: 'FK_TaxiExpense_transport_days_TransportDayId',
    }).onDelete('cascade'),
  ],
);

export const monthlyTransportSheetsInTransportation = transportation.table(
  'monthly_transport_sheets',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'MonthlyTransportSheets_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    crewId: bigint('CrewId', { mode: 'number' }).notNull(),
    year: integer('Year').notNull(),
    month: integer('Month').notNull(),
    isConfirmed: boolean('IsConfirmed').default(false).notNull(),
    confirmedById: bigint('ConfirmedById', { mode: 'number' }),
    createdById: bigint('CreatedById', { mode: 'number' }).notNull(),
    confirmedAt: timestamp('ConfirmedAt', { withTimezone: true, mode: 'string' }),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
    isPaid: boolean('IsPaid').default(false).notNull(),
    paidAt: timestamp('PaidAt', { withTimezone: true, mode: 'string' }),
    paidById: bigint('PaidById', { mode: 'number' }),
    recipientId: bigint('RecipientId', { mode: 'number' }).default(0).notNull(),
    amortizationAmount: numeric('AmortizationAmount', { precision: 18, scale: 2 })
      .default('0.0')
      .notNull(),
    kmRate: numeric('KmRate', { precision: 18, scale: 4 }).default('0.0').notNull(),
    tariffPerLeg: numeric('TariffPerLeg', { precision: 18, scale: 2 }).default('0.0').notNull(),
    periodEnd: date('PeriodEnd', { mode: 'string' })
      .default(sql`'-infinity'`)
      .notNull(),
    periodStart: date('PeriodStart', { mode: 'string' })
      .default(sql`'-infinity'`)
      .notNull(),
  },
  (table) => [
    index('IX_monthly_transport_sheets_CreatedById').using(
      'btree',
      table.createdById.asc().nullsLast().op('int8_ops'),
    ),
    uniqueIndex('IX_monthly_transport_sheets_CrewId_Year_Month')
      .using(
        'btree',
        table.crewId.asc().nullsLast().op('int8_ops'),
        table.year.asc().nullsLast().op('int4_ops'),
        table.month.asc().nullsLast().op('int4_ops'),
      )
      .where(sql`("IsDeleted" = false)`),
    index('IX_monthly_transport_sheets_PaidById').using(
      'btree',
      table.paidById.asc().nullsLast().op('int8_ops'),
    ),
    index('IX_monthly_transport_sheets_RecipientId').using(
      'btree',
      table.recipientId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.createdById],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_monthly_transport_sheets_AspNetUsers_CreatedById',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.paidById],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_monthly_transport_sheets_AspNetUsers_PaidById',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.recipientId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_monthly_transport_sheets_AspNetUsers_RecipientId',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.crewId],
      foreignColumns: [crewsInTransportation.id],
      name: 'FK_monthly_transport_sheets_Crews_CrewId',
    }).onDelete('restrict'),
  ],
);

export const crewsInTransportation = transportation.table(
  'Crews',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'Crews_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    name: varchar('Name', { length: 30 }).notNull(),
    routeId: bigint('RouteId', { mode: 'number' }),
    crewLeadId: bigint('CrewLeadId', { mode: 'number' }),
    driverLeadId: bigint('DriverLeadId', { mode: 'number' }),
    seatCapacity: integer('SeatCapacity').notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
    tariffId: bigint('TariffId', { mode: 'number' }),
  },
  (table) => [
    index('IX_Crews_CrewLeadId').using('btree', table.crewLeadId.asc().nullsLast().op('int8_ops')),
    index('IX_Crews_DriverLeadId').using(
      'btree',
      table.driverLeadId.asc().nullsLast().op('int8_ops'),
    ),
    uniqueIndex('IX_Crews_Name')
      .using('btree', table.name.asc().nullsLast().op('text_ops'))
      .where(sql`("IsDeleted" = false)`),
    index('IX_Crews_RouteId').using('btree', table.routeId.asc().nullsLast().op('int8_ops')),
    index('IX_Crews_TariffId').using('btree', table.tariffId.asc().nullsLast().op('int8_ops')),
    foreignKey({
      columns: [table.crewLeadId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_Crews_AspNetUsers_CrewLeadId',
    }),
    foreignKey({
      columns: [table.driverLeadId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_Crews_AspNetUsers_DriverLeadId',
    }),
    foreignKey({
      columns: [table.routeId],
      foreignColumns: [routesInTransportation.id],
      name: 'FK_Crews_Routes_RouteId',
    }).onDelete('restrict'),
    foreignKey({
      columns: [table.tariffId],
      foreignColumns: [tariffsInTransportation.id],
      name: 'FK_Crews_tariffs_TariffId',
    }).onDelete('restrict'),
  ],
);

export const monthlyTransportSheetDaysInTransportation = transportation.table(
  'monthly_transport_sheet_days',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'monthly_transport_sheet_days_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    monthlyTransportSheetId: bigint('MonthlyTransportSheetId', { mode: 'number' }).notNull(),
    transportDayId: bigint('TransportDayId', { mode: 'number' }).notNull(),
    date: date('Date', { mode: 'string' }).notNull(),
    drivenKm: doublePrecision('DrivenKm').notNull(),
    extraBusinessKm: doublePrecision('ExtraBusinessKm').notNull(),
    taxiAmount: numeric('TaxiAmount', { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
    drivenLegCount: integer('DrivenLegCount').default(0).notNull(),
  },
  (table) => [
    uniqueIndex('IX_monthly_transport_sheet_days_MonthlyTransportSheetId_Transp~').using(
      'btree',
      table.monthlyTransportSheetId.asc().nullsLast().op('int8_ops'),
      table.transportDayId.asc().nullsLast().op('int8_ops'),
    ),
    index('IX_monthly_transport_sheet_days_TransportDayId').using(
      'btree',
      table.transportDayId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.monthlyTransportSheetId],
      foreignColumns: [monthlyTransportSheetsInTransportation.id],
      name: 'FK_monthly_transport_sheet_days_monthly_transport_sheets_Month~',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.transportDayId],
      foreignColumns: [transportDaysInTransportation.id],
      name: 'FK_monthly_transport_sheet_days_transport_days_TransportDayId',
    }).onDelete('restrict'),
  ],
);

export const tariffsInTransportation = transportation.table(
  'tariffs',
  {
    id: bigint('Id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity({
      name: 'tariffs_Id_seq',
      startWith: 1,
      increment: 1,
      minValue: 1,
      maxValue: '9223372036854775807',
    }),
    amountPerLeg: numeric('AmountPerLeg', { precision: 18, scale: 2 }).notNull(),
    createdAt: timestamp('CreatedAt', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('UpdatedAt', { withTimezone: true, mode: 'string' }),
    isDeleted: boolean('IsDeleted').notNull(),
    name: varchar('Name', { length: 50 }).default('').notNull(),
  },
  (table) => [
    uniqueIndex('IX_tariffs_Name')
      .using('btree', table.name.asc().nullsLast().op('text_ops'))
      .where(sql`("IsDeleted" = false)`),
  ],
);

export const aspNetUserRolesInTransportation = transportation.table(
  'AspNetUserRoles',
  {
    userId: bigint('UserId', { mode: 'number' }).notNull(),
    roleId: bigint('RoleId', { mode: 'number' }).notNull(),
  },
  (table) => [
    index('IX_AspNetUserRoles_RoleId').using(
      'btree',
      table.roleId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.roleId],
      foreignColumns: [aspNetRolesInTransportation.id],
      name: 'FK_AspNetUserRoles_AspNetRoles_RoleId',
    }).onDelete('cascade'),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_AspNetUserRoles_AspNetUsers_UserId',
    }).onDelete('cascade'),
    primaryKey({ columns: [table.userId, table.roleId], name: 'PK_AspNetUserRoles' }),
  ],
);

export const aspNetUserLoginsInTransportation = transportation.table(
  'AspNetUserLogins',
  {
    loginProvider: text('LoginProvider').notNull(),
    providerKey: text('ProviderKey').notNull(),
    providerDisplayName: text('ProviderDisplayName'),
    userId: bigint('UserId', { mode: 'number' }).notNull(),
  },
  (table) => [
    index('IX_AspNetUserLogins_UserId').using(
      'btree',
      table.userId.asc().nullsLast().op('int8_ops'),
    ),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_AspNetUserLogins_AspNetUsers_UserId',
    }).onDelete('cascade'),
    primaryKey({ columns: [table.loginProvider, table.providerKey], name: 'PK_AspNetUserLogins' }),
  ],
);

export const aspNetUserTokensInTransportation = transportation.table(
  'AspNetUserTokens',
  {
    userId: bigint('UserId', { mode: 'number' }).notNull(),
    loginProvider: text('LoginProvider').notNull(),
    name: text('Name').notNull(),
    value: text('Value'),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [aspNetUsersInTransportation.id],
      name: 'FK_AspNetUserTokens_AspNetUsers_UserId',
    }).onDelete('cascade'),
    primaryKey({
      columns: [table.userId, table.loginProvider, table.name],
      name: 'PK_AspNetUserTokens',
    }),
  ],
);
