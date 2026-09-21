import { z, ZodError } from 'zod';
import type { RequestHandler } from 'express';
import { BadRequestError } from '../shared/errors.ts';

export function validateQuery<T extends z.ZodType>(schema: T): RequestHandler {
  return (req, _res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
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
