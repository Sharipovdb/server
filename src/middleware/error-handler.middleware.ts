import type { ErrorRequestHandler } from 'express';
import { getConfig } from '../config/index.ts';

interface StatusCarrier {
  status?: unknown;
  statusCode?: unknown;
}

function resolveStatus(error: unknown): number {
  if (typeof error !== 'object' || error === null) {
    return 500;
  }

  const carrier = error as StatusCarrier;
  const candidate = typeof carrier.status === 'number' ? carrier.status : carrier.statusCode;

  if (
    typeof candidate === 'number' &&
    Number.isInteger(candidate) &&
    candidate >= 400 &&
    candidate <= 599
  ) {
    return candidate;
  }

  return 500;
}

function resolveMessage(error: unknown, status: number): string {
  if (status >= 500 && getConfig().isProduction) {
    return 'Internal Server Error';
  }

  if (error instanceof Error && error.message !== '') {
    return error.message;
  }

  return 'Internal Server Error';
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = resolveStatus(error);

  if (status >= 500) {
    console.error(error);
  }

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    error: {
      status,
      message: resolveMessage(error, status),
    },
  });
};
