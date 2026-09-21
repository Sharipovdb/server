import type { AuthenticatedUser } from '../dtos/auth.dto.ts';

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthenticatedUser;
    validatedQuery?: unknown;
  }
}
