import process from 'node:process';
import type { Server } from 'node:http';
import app from './app.ts';
import { ConfigError, getConfig } from './config/index.ts';

const SHUTDOWN_SIGNALS = ['SIGINT', 'SIGTERM'] as const;

function registerShutdown(server: Server): void {
  for (const signal of SHUTDOWN_SIGNALS) {
    process.once(signal, () => {
      console.log(`Received ${signal}, closing server`);
      server.close(() => {
        process.exit(0);
      });
    });
  }
}

function start(): void {
  const config = getConfig();

  const server = app.listen(config.port, () => {
    console.log(`CrewMove API listening on http://localhost:${config.port} (${config.nodeEnv})`);
  });

  registerShutdown(server);
}

try {
  start();
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(`Configuration error: ${error.message}`);
    process.exit(1);
  }

  throw error;
}
