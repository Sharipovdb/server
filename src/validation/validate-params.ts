import { z, ZodError } from 'zod';
import type { RequestHandler } from 'express';
import { BadRequestError } from '../shared/errors.ts';

export function validateParams<T extends z.ZodType>(schema: T): RequestHandler {
  return (req, _res, next) => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issue) => issue.message).join(' ');
        next(new BadRequestError(message));
        return;
      }
      next(error);
    }
  };
}
