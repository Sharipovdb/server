import process from 'node:process';

export interface HealthStatus {
  status: 'ok';
  uptime: number;
}

export function buildHealthStatus(): HealthStatus {
  return {
    status: 'ok',
    uptime: Number(process.uptime().toFixed(3)),
  };
}
