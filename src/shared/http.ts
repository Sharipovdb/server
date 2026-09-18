import type { Request } from 'express';

export type RequestWithBody<T> = Request<Record<string, never>, unknown, T>;
