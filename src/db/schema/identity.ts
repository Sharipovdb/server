import {
  boolean,
  index,
  integer,
  primaryKey,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { identityPrimaryKey, referenceId, timestampColumn, transportation } from './common.ts';

export const users = transportation.table(
  'AspNetUsers',
  {
    id: identityPrimaryKey(),
    firstName: text('FirstName').notNull(),
    lastName: text('LastName').notNull(),
    telegramId: text('TelegramId'),
    refreshToken: text('RefreshToken'),
    refreshTokenExpiryTime: timestampColumn('RefreshTokenExpiryTime'),
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
    lockoutEnd: timestampColumn('LockoutEnd'),
    lockoutEnabled: boolean('LockoutEnabled').notNull(),
    accessFailedCount: integer('AccessFailedCount').notNull(),
  },
  (table) => [
    uniqueIndex('UserNameIndex').on(table.normalizedUserName),
    index('EmailIndex').on(table.normalizedEmail),
  ],
);

export const roles = transportation.table(
  'AspNetRoles',
  {
    id: identityPrimaryKey(),
    name: varchar('Name', { length: 256 }),
    normalizedName: varchar('NormalizedName', { length: 256 }),
    concurrencyStamp: text('ConcurrencyStamp'),
  },
  (table) => [uniqueIndex('RoleNameIndex').on(table.normalizedName)],
);

export const userRoles = transportation.table(
  'AspNetUserRoles',
  {
    userId: referenceId('UserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: referenceId('RoleId')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ name: 'PK_AspNetUserRoles', columns: [table.userId, table.roleId] }),
    index('IX_AspNetUserRoles_RoleId').on(table.roleId),
  ],
);

export const roleClaims = transportation.table(
  'AspNetRoleClaims',
  {
    id: integer('Id').primaryKey().generatedByDefaultAsIdentity(),
    roleId: referenceId('RoleId')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
    claimType: text('ClaimType'),
    claimValue: text('ClaimValue'),
  },
  (table) => [index('IX_AspNetRoleClaims_RoleId').on(table.roleId)],
);

export const userClaims = transportation.table(
  'AspNetUserClaims',
  {
    id: integer('Id').primaryKey().generatedByDefaultAsIdentity(),
    userId: referenceId('UserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    claimType: text('ClaimType'),
    claimValue: text('ClaimValue'),
  },
  (table) => [index('IX_AspNetUserClaims_UserId').on(table.userId)],
);

export const userLogins = transportation.table(
  'AspNetUserLogins',
  {
    loginProvider: text('LoginProvider').notNull(),
    providerKey: text('ProviderKey').notNull(),
    providerDisplayName: text('ProviderDisplayName'),
    userId: referenceId('UserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({
      name: 'PK_AspNetUserLogins',
      columns: [table.loginProvider, table.providerKey],
    }),
    index('IX_AspNetUserLogins_UserId').on(table.userId),
  ],
);

export const userTokens = transportation.table(
  'AspNetUserTokens',
  {
    userId: referenceId('UserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    loginProvider: text('LoginProvider').notNull(),
    name: text('Name').notNull(),
    value: text('Value'),
  },
  (table) => [
    primaryKey({
      name: 'PK_AspNetUserTokens',
      columns: [table.userId, table.loginProvider, table.name],
    }),
  ],
);
