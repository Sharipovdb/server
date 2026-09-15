import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { getConfig, getSeedConfig } from '../config/index.ts';

const TEST_DATABASE_SUFFIX = '_test';
const MIGRATIONS_FOLDER = 'src/db/migrations';

function assertTestDatabase(databaseUrl: string): void {
  const databaseName = new URL(databaseUrl).pathname.slice(1);

  if (!databaseName.endsWith(TEST_DATABASE_SUFFIX)) {
    throw new Error(
      `Refusing to reset "${databaseName}": tests only run against a *${TEST_DATABASE_SUFFIX} database.`,
    );
  }
}

export default async function setup(): Promise<void> {
  assertTestDatabase(getConfig().databaseUrl);

  const [{ closeDb, db }, { seedIdentity }] = await Promise.all([
    import('../db/index.ts'),
    import('../db/seeders/identity.seeder.ts'),
  ]);

  try {
    await db.execute(sql`drop schema if exists transportation cascade`);
    await db.execute(sql`drop schema if exists drizzle cascade`);
    await migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
    await seedIdentity(getSeedConfig().admin, db);
  } finally {
    await closeDb();
  }
}
