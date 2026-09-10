import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getConfig } from '../config/index.ts';
import * as relations from './schema/relations.ts';
import * as tables from './schema/schema.ts';

const schema = { ...tables, ...relations };

export type Database = NodePgDatabase<typeof schema>;

let pool: pg.Pool | null = null;
let database: Database | null = null;

export function getDb(): Database {
  if (database === null) {
    pool = new pg.Pool({ connectionString: getConfig().databaseUrl });
    database = drizzle({ client: pool, schema });
  }

  return database;
}

export async function closeDb(): Promise<void> {
  if (pool === null) {
    return;
  }

  const closing = pool;
  pool = null;
  database = null;
  await closing.end();
}
