import jwt from 'jsonwebtoken';
import type { JwtPayload, SignOptions } from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import type { JwtSettings } from '../config/index.ts';
import {
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  readAccessToken,
} from './token.service.ts';

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

describe('readAccessToken', () => {
  const CREW_LEAD = {
    id: 7,
    userName: 'crew.lead',
    email: null,
    phoneNumber: null,
    telegramId: null,
    roles: ['CrewLead'],
  };

  function signRaw(payload: Record<string, unknown>, options: SignOptions = {}): string {
    return jwt.sign(payload, SETTINGS.secret, {
      issuer: SETTINGS.issuer,
      audience: SETTINGS.audience,
      expiresIn: 60,
      ...options,
    });
  }

  it('reads the user out of a token issued by createAccessToken', () => {
    expect(readAccessToken(createAccessToken(CREW_LEAD, SETTINGS), SETTINGS)).toEqual({
      id: 7,
      userName: 'crew.lead',
      roles: ['CrewLead'],
    });
  });

  it('rejects a token signed with another secret', () => {
    const token = createAccessToken(CREW_LEAD, { ...SETTINGS, secret: 'o'.repeat(32) });

    expect(readAccessToken(token, SETTINGS)).toBeUndefined();
  });

  it('rejects a token issued for another audience', () => {
    const token = createAccessToken(CREW_LEAD, { ...SETTINGS, audience: 'other-client' });

    expect(readAccessToken(token, SETTINGS)).toBeUndefined();
  });

  it('rejects a token from another issuer', () => {
    const token = createAccessToken(CREW_LEAD, { ...SETTINGS, issuer: 'other-backend' });

    expect(readAccessToken(token, SETTINGS)).toBeUndefined();
  });

  it('rejects an expired token', () => {
    const token = signRaw({ nameid: '7', role: ['CrewLead'] }, { expiresIn: -60 });

    expect(readAccessToken(token, SETTINGS)).toBeUndefined();
  });

  it('rejects a string that is not a token', () => {
    expect(readAccessToken('not-a-token', SETTINGS)).toBeUndefined();
  });

  it('rejects a token without a user id', () => {
    expect(readAccessToken(signRaw({ unique_name: 'ghost' }), SETTINGS)).toBeUndefined();
  });

  it('accepts a single role written as a string, the way C# writes it', () => {
    const token = signRaw({ nameid: '7', unique_name: 'admin', role: 'Admin' });

    expect(readAccessToken(token, SETTINGS)?.roles).toEqual(['Admin']);
  });

  it('reports an empty role list when the claim is missing', () => {
    const token = signRaw({ nameid: '7', unique_name: 'admin' });

    expect(readAccessToken(token, SETTINGS)?.roles).toEqual([]);
  });
});
