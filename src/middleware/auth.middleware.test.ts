import express from 'express';
import type { Express, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { getConfig } from '../config/index.ts';
import { createAccessToken } from '../services/token.service.ts';
import { RoleName } from '../shared/role-names.ts';
import { currentUser, requireAuth, requireRole } from './auth.middleware.ts';
import { errorHandler } from './error-handler.middleware.ts';

const ANONYMOUS_PATH = '/anonymous';
const PROTECTED_PATH = '/protected';
const ACCOUNTING_PATH = '/accounting';

const UNAUTHORIZED_BODY = { error: { status: 401, message: 'Authentication required' } };
const FORBIDDEN_BODY = { error: { status: 403, message: 'Access denied' } };

function buildApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(currentUser);

  app.get(ANONYMOUS_PATH, (req: Request, res: Response) => {
    res.json({ user: req.user ?? null });
  });

  app.get(PROTECTED_PATH, requireAuth, (req: Request, res: Response) => {
    res.json({ user: req.user });
  });

  app.get(
    ACCOUNTING_PATH,
    requireRole(RoleName.Admin, RoleName.Accountant),
    (_req: Request, res: Response) => {
      res.json({ ok: true });
    },
  );

  app.use(errorHandler);

  return app;
}

const app = buildApp();

function tokenFor(roles: readonly string[], id = 11): string {
  return createAccessToken(
    { id, userName: 'crew.lead', email: null, phoneNumber: null, telegramId: null, roles },
    getConfig().jwt,
  );
}

function get(path: string, token?: string) {
  const call = request(app).get(path);

  return token === undefined ? call : call.set('Authorization', `Bearer ${token}`);
}

describe('currentUser', () => {
  it('leaves the request anonymous when there is no token', async () => {
    const response = await get(ANONYMOUS_PATH);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: null });
  });

  it('ignores a broken token instead of failing the request', async () => {
    const response = await get(ANONYMOUS_PATH, 'not-a-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ user: null });
  });

  it('puts id, userName and roles on the request', async () => {
    const response = await get(PROTECTED_PATH, tokenFor([RoleName.CrewLead], 42));

    expect(response.body).toEqual({
      user: { id: 42, userName: 'crew.lead', roles: [RoleName.CrewLead] },
    });
  });
});

describe('requireAuth', () => {
  it('answers 401 without a token', async () => {
    const response = await get(PROTECTED_PATH);

    expect(response.status).toBe(401);
    expect(response.body).toEqual(UNAUTHORIZED_BODY);
  });

  it('answers 401 when the header carries no Bearer scheme', async () => {
    const response = await request(app).get(PROTECTED_PATH).set('Authorization', tokenFor([]));

    expect(response.status).toBe(401);
  });

  it('answers 401 for an expired token', async () => {
    const { secret, issuer, audience } = getConfig().jwt;
    const expired = jwt.sign({ nameid: '11', role: [] }, secret, {
      issuer,
      audience,
      expiresIn: -60,
    });

    const response = await get(PROTECTED_PATH, expired);

    expect(response.status).toBe(401);
  });

  it('lets a valid token through', async () => {
    const response = await get(PROTECTED_PATH, tokenFor([RoleName.Worker]));

    expect(response.status).toBe(200);
  });
});

describe('requireRole', () => {
  it('answers 401 without a token, as ASP.NET does', async () => {
    const response = await get(ACCOUNTING_PATH);

    expect(response.status).toBe(401);
    expect(response.body).toEqual(UNAUTHORIZED_BODY);
  });

  it('answers 403 when the user has none of the listed roles', async () => {
    const response = await get(ACCOUNTING_PATH, tokenFor([RoleName.Worker]));

    expect(response.status).toBe(403);
    expect(response.body).toEqual(FORBIDDEN_BODY);
  });

  it('answers 403 when the user has no roles at all', async () => {
    const response = await get(ACCOUNTING_PATH, tokenFor([]));

    expect(response.status).toBe(403);
  });

  it('lets through a user who has one of the listed roles', async () => {
    const response = await get(ACCOUNTING_PATH, tokenFor([RoleName.Accountant]));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it('lets through a user who also carries other roles', async () => {
    const response = await get(ACCOUNTING_PATH, tokenFor([RoleName.Worker, RoleName.Admin]));

    expect(response.status).toBe(200);
  });
});
