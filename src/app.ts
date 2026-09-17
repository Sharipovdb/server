import express from 'express';
import type { Express } from 'express';
import { registerRoutes } from './routes/index.ts';
import { currentUser } from './middleware/auth.middleware.ts';
import { notFoundHandler } from './middleware/not-found.middleware.ts';
import { errorHandler } from './middleware/error-handler.middleware.ts';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());
  app.use(currentUser);

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;
