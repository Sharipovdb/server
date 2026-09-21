import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from '../docs/openapi.ts';
import { authRouter } from './auth.routes.ts';
import { healthRouter } from './health.routes.ts';
import { routeRouter } from './route.routes.ts';
import { tariffRouter } from './tariff.routes.ts';

export function registerRoutes(app: Express): void {
  app.use('/health', healthRouter);
  app.use('/api/Auth', authRouter);
  app.use('/api/Route', routeRouter);
  app.use('/api/Tariff', tariffRouter);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
}
