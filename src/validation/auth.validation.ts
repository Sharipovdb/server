import type { LoginRequest, RefreshTokenRequest } from '../dtos/auth.dto.ts';
import { readRequiredStrings } from './required-fields.ts';

export function parseLoginRequest(body: unknown): LoginRequest {
  const fields = readRequiredStrings(body, ['UserName', 'Password']);

  return { userName: fields.UserName, password: fields.Password };
}

export function parseRefreshTokenRequest(body: unknown): RefreshTokenRequest {
  const fields = readRequiredStrings(body, ['RefreshToken']);

  return { refreshToken: fields.RefreshToken };
}
