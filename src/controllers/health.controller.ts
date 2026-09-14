import type { Request, Response } from 'express';
import { buildHealthStatus } from '../services/health.service.ts';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  const health = await buildHealthStatus();

  res.status(health.status === 'ok' ? 200 : 503).json(health);
}
