import type { Express } from 'express';
import { healthRouter } from './health.routes.ts';

export function registerRoutes(app: Express): void {
  app.use('/health', healthRouter);
}
