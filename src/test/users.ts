import { randomUUID } from 'node:crypto';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/index.ts';
import { users } from '../db/schema/index.ts';
import { addUserToRoles, createUser } from '../repositories/user.repository.ts';
import { hashPassword } from '../services/password-hasher.ts';
import type { RoleName } from '../shared/role-names.ts';

const SECONDS_PER_DAY = 86_400;

export const TEST_PASSWORD = 'Correct-Password-1';

export interface TestUser {
  readonly id: number;
  readonly userName: string;
}

export interface StoredRefreshToken {
  readonly hash: string | null;
  readonly daysUntilExpiry: number;
}

export async function createTestUser(roleNames: readonly RoleName[] = []): Promise<TestUser> {
  const userName = `test.${randomUUID()}`;

  const id = await createUser({
    userName,
    passwordHash: await hashPassword(TEST_PASSWORD),
    firstName: 'Test',
    lastName: 'User',
  });

  await addUserToRoles(id, roleNames);

  return { id, userName };
}

export async function expireRefreshToken(userId: number): Promise<void> {
  await db
    .update(users)
    .set({ refreshTokenExpiryTime: sql`now() - interval '1 minute'` })
    .where(eq(users.id, userId));
}

export async function readStoredRefreshToken(userId: number): Promise<StoredRefreshToken> {
  const [stored] = await db
    .select({
      hash: users.refreshToken,
      daysUntilExpiry:
        sql<number>`extract(epoch from (${users.refreshTokenExpiryTime} - now())) / ${SECONDS_PER_DAY}`.mapWith(
          Number,
        ),
    })
    .from(users)
    .where(eq(users.id, userId));

  if (stored === undefined) {
    throw new Error(`Test user ${userId} does not exist`);
  }

  return stored;
}
