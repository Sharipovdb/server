import type { SeedConfig } from '../../config/index.ts';
import {
  addUserToRoles,
  createUser,
  findUserByUserName,
} from '../../repositories/user.repository.ts';
import { hashPassword } from '../../services/password-hasher.ts';
import { normalizeIdentityName } from '../../shared/identity-name.ts';
import { ALL_ROLE_NAMES, RoleName } from '../../shared/role-names.ts';
import { db } from '../index.ts';
import type { Executor } from '../index.ts';
import { roles } from '../schema/index.ts';

type AdminCredentials = SeedConfig['admin'];

const ADMIN_PROFILE = {
  email: 'admin@crewmove.local',
  firstName: 'System',
  lastName: 'Administrator',
  phoneNumber: '+998900000000',
  telegramId: 'admin',
};

async function seedRoles(executor: Executor): Promise<void> {
  await executor
    .insert(roles)
    .values(ALL_ROLE_NAMES.map((name) => ({ name, normalizedName: normalizeIdentityName(name) })))
    .onConflictDoNothing({ target: roles.normalizedName });
}

async function seedAdmin(admin: AdminCredentials, executor: Executor): Promise<void> {
  const existingAdmin = await findUserByUserName(admin.userName, executor);

  if (existingAdmin !== undefined) {
    return;
  }

  const adminId = await createUser(
    {
      userName: admin.userName,
      passwordHash: await hashPassword(admin.password),
      ...ADMIN_PROFILE,
    },
    executor,
  );

  await addUserToRoles(adminId, [RoleName.Admin], executor);
}

export async function seedIdentity(
  admin: AdminCredentials,
  executor: Executor = db,
): Promise<void> {
  await executor.transaction(async (transaction) => {
    await seedRoles(transaction);
    await seedAdmin(admin, transaction);
  });
}
