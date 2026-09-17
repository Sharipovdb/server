import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import type { Executor } from '../db/index.ts';
import { roles, userRoles, users } from '../db/schema/index.ts';
import { normalizeIdentityName } from '../shared/identity-name.ts';

export interface NewUser {
  readonly userName: string;
  readonly passwordHash: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email?: string | null;
  readonly phoneNumber?: string | null;
  readonly telegramId?: string | null;
}

export interface UserIdentity {
  readonly id: number;
  readonly userName: string | null;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly telegramId: string | null;
}

export interface UserCredentials extends UserIdentity {
  readonly passwordHash: string | null;
}

export interface RefreshTokenOwner extends UserIdentity {
  readonly isRefreshTokenExpired: boolean;
}

export interface RefreshTokenReplacement {
  readonly userId: number;
  readonly currentHash: string;
  readonly newHash: string;
  readonly lifetimeDays: number;
}

const identityColumns = {
  id: users.id,
  userName: users.userName,
  email: users.email,
  phoneNumber: users.phoneNumber,
  telegramId: users.telegramId,
};

function expiryAfterDays(lifetimeDays: number) {
  return sql<string>`now() + make_interval(days => ${lifetimeDays}::int)`;
}

export async function createUser(user: NewUser, executor: Executor = db): Promise<number> {
  const email = user.email ?? null;

  const [created] = await executor
    .insert(users)
    .values({
      userName: user.userName,
      normalizedUserName: normalizeIdentityName(user.userName),
      email,
      normalizedEmail: email === null ? null : normalizeIdentityName(email),
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber ?? null,
      telegramId: user.telegramId ?? null,
      passwordHash: user.passwordHash,
      emailConfirmed: false,
      phoneNumberConfirmed: false,
      twoFactorEnabled: false,
      lockoutEnabled: true,
      accessFailedCount: 0,
    })
    .returning({ id: users.id });

  if (created === undefined) {
    throw new Error(`User "${user.userName}" was not created`);
  }

  return created.id;
}

export async function addUserToRoles(
  userId: number,
  roleNames: readonly string[],
  executor: Executor = db,
): Promise<void> {
  const normalizedNames = [...new Set(roleNames.map(normalizeIdentityName))];

  if (normalizedNames.length === 0) {
    return;
  }

  const matchingRoles = await executor
    .select({ id: roles.id })
    .from(roles)
    .where(inArray(roles.normalizedName, normalizedNames));

  if (matchingRoles.length !== normalizedNames.length) {
    throw new Error(`Unknown role among: ${roleNames.join(', ')}`);
  }

  await executor
    .insert(userRoles)
    .values(matchingRoles.map((role) => ({ userId, roleId: role.id })))
    .onConflictDoNothing();
}

export async function findUserByUserName(
  userName: string,
  executor: Executor = db,
): Promise<UserCredentials | undefined> {
  const [user] = await executor
    .select({ ...identityColumns, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.normalizedUserName, normalizeIdentityName(userName)))
    .limit(1);

  return user;
}

export async function findUserByRefreshTokenHash(
  refreshTokenHash: string,
  executor: Executor = db,
): Promise<RefreshTokenOwner | undefined> {
  const [user] = await executor
    .select({
      ...identityColumns,
      isRefreshTokenExpired: sql<boolean>`coalesce(${users.refreshTokenExpiryTime} <= now(), true)`,
    })
    .from(users)
    .where(eq(users.refreshToken, refreshTokenHash))
    .limit(1);

  return user;
}

export async function findRoleNamesByUserId(
  userId: number,
  executor: Executor = db,
): Promise<string[]> {
  const rows = await executor
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId))
    .orderBy(asc(roles.name));

  return rows.flatMap((row) => (row.name === null ? [] : [row.name]));
}

export async function saveRefreshToken(
  userId: number,
  refreshTokenHash: string,
  lifetimeDays: number,
  executor: Executor = db,
): Promise<void> {
  await executor
    .update(users)
    .set({ refreshToken: refreshTokenHash, refreshTokenExpiryTime: expiryAfterDays(lifetimeDays) })
    .where(eq(users.id, userId));
}

export async function replaceRefreshToken(
  replacement: RefreshTokenReplacement,
  executor: Executor = db,
): Promise<boolean> {
  const replaced = await executor
    .update(users)
    .set({
      refreshToken: replacement.newHash,
      refreshTokenExpiryTime: expiryAfterDays(replacement.lifetimeDays),
    })
    .where(and(eq(users.id, replacement.userId), eq(users.refreshToken, replacement.currentHash)))
    .returning({ id: users.id });

  return replaced.length > 0;
}
