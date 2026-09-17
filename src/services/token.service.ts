import { createHash, randomBytes } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { JwtSettings } from '../config/index.ts';
import type { AuthenticatedUser } from '../dtos/auth.dto.ts';

const REFRESH_TOKEN_BYTES = 64;
const SECONDS_PER_MINUTE = 60;

export interface TokenSubject {
  readonly id: number;
  readonly userName: string | null;
  readonly email: string | null;
  readonly phoneNumber: string | null;
  readonly telegramId: string | null;
  readonly roles: readonly string[];
}

export function createAccessToken(subject: TokenSubject, settings: JwtSettings): string {
  const userId = String(subject.id);

  return jwt.sign(
    {
      unique_name: subject.userName ?? '',
      email: subject.email ?? '',
      phone_number: subject.phoneNumber ?? '',
      telegramId: subject.telegramId ?? '',
      nameid: userId,
      role: [...subject.roles],
    },
    settings.secret,
    {
      algorithm: 'HS256',
      subject: userId,
      issuer: settings.issuer,
      audience: settings.audience,
      expiresIn: settings.accessTokenLifetimeMinutes * SECONDS_PER_MINUTE,
    },
  );
}

export function createRefreshToken(): string {
  return randomBytes(REFRESH_TOKEN_BYTES).toString('base64');
}

export function hashRefreshToken(refreshToken: string): string {
  return createHash('sha256').update(refreshToken, 'utf8').digest('hex').toUpperCase();
}

function readRoles(claim: unknown): string[] {
  if (typeof claim === 'string') {
    return [claim];
  }

  if (Array.isArray(claim)) {
    return claim.filter((role): role is string => typeof role === 'string');
  }

  return [];
}

export function readAccessToken(
  token: string,
  settings: JwtSettings,
): AuthenticatedUser | undefined {
  let payload: unknown;

  try {
    payload = jwt.verify(token, settings.secret, {
      algorithms: ['HS256'],
      issuer: settings.issuer,
      audience: settings.audience,
    });
  } catch {
    return undefined;
  }

  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const claims = payload as Record<string, unknown>;
  const id = Number(claims.nameid ?? claims.sub);

  if (!Number.isInteger(id) || id < 1) {
    return undefined;
  }

  return {
    id,
    userName: typeof claims.unique_name === 'string' ? claims.unique_name : '',
    roles: readRoles(claims.role),
  };
}
