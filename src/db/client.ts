import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase, NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import pg from 'pg';
import { getConfig } from '../config/index.ts';
import * as schema from './schema/index.ts';

const CONNECTION_TIMEOUT_MS = 5_000;

export type Database = NodePgDatabase<typeof schema>;

export type Executor = PgDatabase<NodePgQueryResultHKT, typeof schema>;

const pool = new pg.Pool({
  connectionString: getConfig().databaseUrl,
  connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
});

pool.on('error', (error) => {
  console.error('Idle database client failed', error);
});

export const db: Database = drizzle({ client: pool, schema });

export async function closeDb(): Promise<void> {
  if (pool.ending) {
    return;
  }

  await pool.end();
}

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}
