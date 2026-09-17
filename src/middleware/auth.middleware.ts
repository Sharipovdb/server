import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { getConfig } from '../config/index.ts';
import { readAccessToken } from '../services/token.service.ts';
import { ForbiddenError, UnauthorizedError } from '../shared/errors.ts';
import { normalizeIdentityName } from '../shared/identity-name.ts';
import type { RoleName } from '../shared/role-names.ts';

const BEARER_SCHEME = 'bearer';

function readBearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;

  if (header === undefined) {
    return undefined;
  }

  const [scheme, ...rest] = header.split(' ');

  if (scheme === undefined || scheme.toLowerCase() !== BEARER_SCHEME) {
    return undefined;
  }

  const token = rest.join(' ').trim();

  return token === '' ? undefined : token;
}

export function currentUser(req: Request, _res: Response, next: NextFunction): void {
  const token = readBearerToken(req);

  if (token !== undefined) {
    req.user = readAccessToken(token, getConfig().jwt);
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  if (req.user === undefined) {
    throw new UnauthorizedError();
  }

  next();
}

export function requireRole(...roleNames: readonly RoleName[]): RequestHandler {
  const allowedRoles = new Set(roleNames.map(normalizeIdentityName));

  return (req, _res, next) => {
    if (req.user === undefined) {
      throw new UnauthorizedError();
    }

    const hasAllowedRole = req.user.roles.some((role) =>
      allowedRoles.has(normalizeIdentityName(role)),
    );

    if (!hasAllowedRole) {
      throw new ForbiddenError();
    }

    next();
  };
}
