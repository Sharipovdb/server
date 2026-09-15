import { asc, eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { getSeedConfig } from '../../config/index.ts';
import { verifyPassword } from '../../services/password-hasher.ts';
import { normalizeIdentityName } from '../../shared/identity-name.ts';
import { ALL_ROLE_NAMES, RoleName } from '../../shared/role-names.ts';
import { closeDb, db } from '../index.ts';
import { roles, userRoles, users } from '../schema/index.ts';
import { seedIdentity } from './identity.seeder.ts';

const admin = getSeedConfig().admin;

afterAll(closeDb);

async function findAdmins() {
  return db
    .select()
    .from(users)
    .where(eq(users.normalizedUserName, normalizeIdentityName(admin.userName)));
}

async function findSingleAdmin() {
  const [stored, ...duplicates] = await findAdmins();

  if (stored === undefined || duplicates.length > 0) {
    throw new Error('Expected exactly one seeded administrator');
  }

  return stored;
}

async function findRoleNamesOf(userId: number) {
  return db
    .select({ name: roles.name })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
}

describe('seedIdentity', () => {
  it('creates the six roles with normalized names', async () => {
    const stored = await db
      .select({ name: roles.name, normalizedName: roles.normalizedName })
      .from(roles)
      .orderBy(asc(roles.name));

    expect(stored).toEqual(
      [...ALL_ROLE_NAMES]
        .sort()
        .map((name) => ({ name, normalizedName: normalizeIdentityName(name) })),
    );
  });

  it('creates the administrator from the seed settings with a bcrypt password', async () => {
    const stored = await findSingleAdmin();

    expect(stored).toMatchObject({
      userName: admin.userName,
      normalizedUserName: normalizeIdentityName(admin.userName),
      firstName: 'System',
      lastName: 'Administrator',
      email: 'admin@crewmove.local',
    });
    expect(stored.passwordHash).not.toBe(admin.password);
    await expect(verifyPassword(admin.password, stored.passwordHash)).resolves.toBe(true);
  });

  it('gives the administrator the Admin role only', async () => {
    const stored = await findSingleAdmin();

    await expect(findRoleNamesOf(stored.id)).resolves.toEqual([{ name: RoleName.Admin }]);
  });

  it('creates no duplicates when it runs again', async () => {
    await seedIdentity(admin);
    await seedIdentity(admin);

    const stored = await findSingleAdmin();

    await expect(db.$count(roles)).resolves.toBe(ALL_ROLE_NAMES.length);
    await expect(findRoleNamesOf(stored.id)).resolves.toHaveLength(1);
  });
});
