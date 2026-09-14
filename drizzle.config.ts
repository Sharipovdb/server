import { existsSync } from 'node:fs';
import process from 'node:process';
import { defineConfig } from 'drizzle-kit';

const REFERENCE_DATABASE = 'transportation_db';

if (existsSync('.env')) {
  process.loadEnvFile();
}

const url = process.env.DATABASE_URL;

if (url === undefined || url.trim() === '') {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill in the values.');
}

if (new URL(url).pathname === `/${REFERENCE_DATABASE}`) {
  throw new Error(
    `DATABASE_URL points to ${REFERENCE_DATABASE}, the read-only C# reference database.`,
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dbCredentials: { url },
  schemaFilter: ['transportation'],
});
