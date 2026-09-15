import { existsSync } from 'node:fs';
import process from 'node:process';
import { defineConfig } from 'vitest/config';

const TEST_ENV_FILE = '.env.test';

if (!existsSync(TEST_ENV_FILE)) {
  throw new Error(
    `${TEST_ENV_FILE} is missing. Copy .env.test.example to ${TEST_ENV_FILE} and fill in the values.`,
  );
}

process.loadEnvFile(TEST_ENV_FILE);

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    globalSetup: ['src/test/global-setup.ts'],
  },
});
