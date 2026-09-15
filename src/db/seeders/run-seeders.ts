import process from 'node:process';
import { ConfigError, getConfig, getSeedConfig } from '../../config/index.ts';

async function run(): Promise<void> {
  getConfig();
  const { admin } = getSeedConfig();

  const [{ closeDb }, { seedIdentity }] = await Promise.all([
    import('../index.ts'),
    import('./identity.seeder.ts'),
  ]);

  try {
    await seedIdentity(admin);
    console.log(`Roles and administrator "${admin.userName}" are seeded`);
  } finally {
    await closeDb();
  }
}

try {
  await run();
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(`Configuration error: ${error.message}`);
    process.exit(1);
  }

  throw error;
}
