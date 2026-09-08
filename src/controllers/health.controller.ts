import type { Request, Response } from 'express';
import { buildHealthStatus } from '../services/health.service.ts';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json(buildHealthStatus());
}
