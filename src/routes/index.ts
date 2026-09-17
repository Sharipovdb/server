import type { Express } from 'express';
import { authRouter } from './auth.routes.ts';
import { healthRouter } from './health.routes.ts';

export function registerRoutes(app: Express): void {
  app.use('/health', healthRouter);
  app.use('/api/Auth', authRouter);
}
