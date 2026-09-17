import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import type { JwtSettings } from '../config/index.ts';
import { createAccessToken, createRefreshToken, hashRefreshToken } from './token.service.ts';

const SETTINGS: JwtSettings = {
  secret: 's'.repeat(32),
  issuer: 'test-issuer',
  audience: 'test-audience',
  accessTokenLifetimeMinutes: 15,
  refreshTokenLifetimeDays: 7,
};

const ADMIN = {
  id: 42,
  userName: 'admin',
  email: 'admin@crewmove.local',
  phoneNumber: null,
  telegramId: 'admin',
  roles: ['Admin', 'Worker'],
};

function decode(token: string): JwtPayload {
  return jwt.decode(token) as JwtPayload;
}

describe('createAccessToken', () => {
  it('signs HS256 with the configured issuer and audience', () => {
    const token = createAccessToken(ADMIN, SETTINGS);

    expect(() =>
      jwt.verify(token, SETTINGS.secret, {
        algorithms: ['HS256'],
        issuer: SETTINGS.issuer,
        audience: SETTINGS.audience,
      }),
    ).not.toThrow();
  });

  it('carries the same user claims as the C# token', () => {
    expect(decode(createAccessToken(ADMIN, SETTINGS))).toMatchObject({
      sub: '42',
      nameid: '42',
      unique_name: 'admin',
      email: 'admin@crewmove.local',
      phone_number: '',
      telegramId: 'admin',
      role: ['Admin', 'Worker'],
    });
  });

  it('carries an empty role list for a user without roles', () => {
    expect(decode(createAccessToken({ ...ADMIN, roles: [] }, SETTINGS)).role).toEqual([]);
  });

  it('expires after the configured lifetime', () => {
    const payload = decode(createAccessToken(ADMIN, SETTINGS));

    expect((payload.exp ?? 0) - (payload.iat ?? 0)).toBe(15 * 60);
  });
});

describe('createRefreshToken', () => {
  it('encodes 64 random bytes in Base64', () => {
    const token = createRefreshToken();
    const bytes = Buffer.from(token, 'base64');

    expect(bytes).toHaveLength(64);
    expect(bytes.toString('base64')).toBe(token);
  });

  it('never repeats', () => {
    expect(createRefreshToken()).not.toBe(createRefreshToken());
  });
});

describe('hashRefreshToken', () => {
  it('produces the uppercase hex SHA-256 digest that C# stores', () => {
    expect(hashRefreshToken('abc')).toBe(
      'BA7816BF8F01CFEA414140DE5DAE2223B00361A396177A9CB410FF61F20015AD',
    );
  });
});
