import process from 'node:process';
import { isDatabaseReachable } from '../db/index.ts';

export interface HealthStatus {
  status: 'ok' | 'unavailable';
  uptime: number;
  database: 'up' | 'down';
}

export async function buildHealthStatus(): Promise<HealthStatus> {
  const databaseReachable = await isDatabaseReachable();

  return {
    status: databaseReachable ? 'ok' : 'unavailable',
    uptime: Number(process.uptime().toFixed(3)),
    database: databaseReachable ? 'up' : 'down',
  };
}
