import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../app.ts';
import { getConfig, getSeedConfig } from '../config/index.ts';
import { closeDb } from '../db/index.ts';
import type { TokenResponse } from '../dtos/auth.dto.ts';
import { hashRefreshToken } from '../services/token.service.ts';
import type { ApiResponse } from '../shared/api-response.ts';
import { RoleName } from '../shared/role-names.ts';
import {
  createTestUser,
  expireRefreshToken,
  readStoredRefreshToken,
  TEST_PASSWORD,
} from '../test/users.ts';

const LOGIN_PATH = '/api/Auth/login';
const REFRESH_PATH = '/api/Auth/refresh';

const WRONG_CREDENTIALS: ApiResponse<TokenResponse> = {
  isSuccess: false,
  statusCode: 400,
  message: 'Wrong username or password!',
  data: null,
};

const INVALID_REFRESH_TOKEN: ApiResponse<TokenResponse> = {
  isSuccess: false,
  statusCode: 400,
  message: 'Invalid refresh token',
  data: null,
};

const EXPIRED_REFRESH_TOKEN: ApiResponse<TokenResponse> = {
  isSuccess: false,
  statusCode: 400,
  message: 'Refresh token expired',
  data: null,
};

afterAll(closeDb);

async function post(path: string, body: object) {
  const response = await request(app).post(path).send(body);

  return { status: response.status, body: response.body as ApiResponse<TokenResponse> };
}

async function loginAs(userName: string, password = TEST_PASSWORD): Promise<TokenResponse> {
  const { body } = await post(LOGIN_PATH, { userName, password });

  if (!body.isSuccess || !body.data) {
    throw new Error(`Login as "${userName}" failed: ${JSON.stringify(body)}`);
  }

  return body.data;
}

function verifyAccessToken(token: string): JwtPayload {
  const { secret, issuer, audience } = getConfig().jwt;

  return jwt.verify(token, secret, { algorithms: ['HS256'], issuer, audience }) as JwtPayload;
}

function rolesIn(token: string): string[] {
  return [...(verifyAccessToken(token).role as string[])].sort();
}

describe('POST /api/Auth/login', () => {
  it('returns an access token and a refresh token for valid credentials', async () => {
    const user = await createTestUser([RoleName.Worker, RoleName.CrewLead]);

    const { status, body } = await post(LOGIN_PATH, {
      userName: user.userName,
      password: TEST_PASSWORD,
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      isSuccess: true,
      statusCode: 200,
      message: 'Logged in successfully',
    });
    expect(verifyAccessToken(body.data?.accessToken ?? '').sub).toBe(String(user.id));
    expect(rolesIn(body.data?.accessToken ?? '')).toEqual([RoleName.CrewLead, RoleName.Worker]);
    expect(body.data?.refreshToken).toEqual(expect.any(String));
  });

  it('finds the user regardless of username case', async () => {
    const user = await createTestUser();

    await expect(loginAs(user.userName.toUpperCase())).resolves.toBeDefined();
  });

  it('stores only the SHA-256 hash of the refresh token, valid for seven days', async () => {
    const user = await createTestUser();

    const issued = await loginAs(user.userName);
    const stored = await readStoredRefreshToken(user.id);

    expect(stored.hash).toBe(hashRefreshToken(issued.refreshToken));
    expect(stored.hash).not.toBe(issued.refreshToken);
    expect(stored.daysUntilExpiry).toBeCloseTo(7, 1);
  });

  it('answers a wrong password with HTTP 200 and the C# failure body', async () => {
    const user = await createTestUser();

    const { status, body } = await post(LOGIN_PATH, {
      userName: user.userName,
      password: 'Wrong-Password-1',
    });

    expect(status).toBe(200);
    expect(body).toEqual(WRONG_CREDENTIALS);
  });

  it('answers an unknown user exactly like a wrong password', async () => {
    const { status, body } = await post(LOGIN_PATH, {
      userName: 'nobody.registered',
      password: TEST_PASSWORD,
    });

    expect(status).toBe(200);
    expect(body).toEqual(WRONG_CREDENTIALS);
  });

  it('rejects a body without credentials with 400', async () => {
    const { status } = await post(LOGIN_PATH, {});

    expect(status).toBe(400);
  });

  it('logs in the seeded administrator with the Admin role', async () => {
    const { userName, password } = getSeedConfig().admin;

    const issued = await loginAs(userName, password);

    expect(rolesIn(issued.accessToken)).toEqual([RoleName.Admin]);
  });
});

describe('POST /api/Auth/refresh', () => {
  it('exchanges a valid refresh token for a new pair', async () => {
    const user = await createTestUser([RoleName.Worker]);
    const issued = await loginAs(user.userName);

    const { status, body } = await post(REFRESH_PATH, { refreshToken: issued.refreshToken });

    expect(status).toBe(200);
    expect(body).toMatchObject({ isSuccess: true, statusCode: 200, message: null });
    expect(body.data?.refreshToken).not.toBe(issued.refreshToken);
    expect(verifyAccessToken(body.data?.accessToken ?? '').sub).toBe(String(user.id));
    expect(rolesIn(body.data?.accessToken ?? '')).toEqual([RoleName.Worker]);
    await expect(readStoredRefreshToken(user.id)).resolves.toMatchObject({
      hash: hashRefreshToken(body.data?.refreshToken ?? ''),
    });
  });

  it('rejects a refresh token that was already exchanged', async () => {
    const user = await createTestUser();
    const issued = await loginAs(user.userName);
    await post(REFRESH_PATH, { refreshToken: issued.refreshToken });

    const { status, body } = await post(REFRESH_PATH, { refreshToken: issued.refreshToken });

    expect(status).toBe(200);
    expect(body).toEqual(INVALID_REFRESH_TOKEN);
  });

  it('rejects an expired refresh token', async () => {
    const user = await createTestUser();
    const issued = await loginAs(user.userName);
    await expireRefreshToken(user.id);

    const { status, body } = await post(REFRESH_PATH, { refreshToken: issued.refreshToken });

    expect(status).toBe(200);
    expect(body).toEqual(EXPIRED_REFRESH_TOKEN);
  });

  it('rejects a refresh token that was never issued', async () => {
    const { body } = await post(REFRESH_PATH, { refreshToken: 'never-issued' });

    expect(body).toEqual(INVALID_REFRESH_TOKEN);
  });

  it('rejects a body without refreshToken with 400', async () => {
    const { status } = await post(REFRESH_PATH, {});

    expect(status).toBe(400);
  });
});
