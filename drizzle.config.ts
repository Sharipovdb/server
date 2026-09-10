import { existsSync } from 'node:fs';
import process from 'node:process';
import { defineConfig } from 'drizzle-kit';

if (existsSync('.env')) {
  process.loadEnvFile();
}

const url = process.env.DATABASE_URL;

if (url === undefined || url.trim() === '') {
  throw new Error('DATABASE_URL is not set. Copy .env.example to .env and fill in the values.');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/schema.ts',
  out: './src/db/schema',
  dbCredentials: { url },
  schemaFilter: ['transportation'],
  introspect: { casing: 'camel' },
});
