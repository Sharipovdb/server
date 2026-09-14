import process from 'node:process';
import type { Server } from 'node:http';
import { ConfigError, getConfig } from './config/index.ts';

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const;

function registerShutdown(server: Server, closeDb: () => Promise<void>): void {
  let shuttingDown = false;

  for (const signal of SHUTDOWN_SIGNALS) {
    process.once(signal, () => {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;
      console.log(`Received ${signal}, closing server`);

      server.close(() => {
        closeDb().then(
          () => {
            console.log('Database pool closed');
            process.exit(0);
          },
          (error: unknown) => {
            console.error('Failed to close database pool', error);
            process.exit(1);
          },
        );
      });
    });
  }
}

async function start(): Promise<void> {
  const config = getConfig();

  const [{ default: app }, { closeDb }] = await Promise.all([
    import('./app.ts'),
    import('./db/index.ts'),
  ]);

  const server = app.listen(config.port, () => {
    console.log(`CrewMove API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  registerShutdown(server, closeDb);
}

try {
  await start();
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(`Configuration error: ${error.message}`);
    process.exit(1);
  }

  throw error;
}
