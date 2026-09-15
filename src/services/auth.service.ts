import { getConfig } from '../config/index.ts';
import type { LoginRequest, RefreshTokenRequest, TokenResponse } from '../dtos/auth.dto.ts';
import {
  findRoleNamesByUserId,
  findUserByRefreshTokenHash,
  findUserByUserName,
  replaceRefreshToken,
  saveRefreshToken,
} from '../repositories/user.repository.ts';
import type { UserIdentity } from '../repositories/user.repository.ts';
import { failureResponse, successResponse } from '../shared/api-response.ts';
import type { ApiResponse } from '../shared/api-response.ts';
import { verifyPassword } from './password-hasher.ts';
import { createAccessToken, createRefreshToken, hashRefreshToken } from './token.service.ts';

export const AuthMessage = {
  LoggedIn: 'Logged in successfully',
  WrongCredentials: 'Wrong username or password!',
  InvalidRefreshToken: 'Invalid refresh token',
  RefreshTokenExpired: 'Refresh token expired',
} as const;

interface IssuedTokens {
  readonly response: TokenResponse;
  readonly refreshTokenHash: string;
}

async function issueTokens(user: UserIdentity): Promise<IssuedTokens> {
  const roles = await findRoleNamesByUserId(user.id);
  const refreshToken = createRefreshToken();

  return {
    response: {
      accessToken: createAccessToken({ ...user, roles }, getConfig().jwt),
      refreshToken,
    },
    refreshTokenHash: hashRefreshToken(refreshToken),
  };
}

export async function login(request: LoginRequest): Promise<ApiResponse<TokenResponse>> {
  const user = await findUserByUserName(request.userName);

  if (user === undefined || !(await verifyPassword(request.password, user.passwordHash))) {
    return failureResponse(AuthMessage.WrongCredentials);
  }

  const tokens = await issueTokens(user);

  await saveRefreshToken(
    user.id,
    tokens.refreshTokenHash,
    getConfig().jwt.refreshTokenLifetimeDays,
  );

  return successResponse(tokens.response, AuthMessage.LoggedIn);
}

export async function refresh(request: RefreshTokenRequest): Promise<ApiResponse<TokenResponse>> {
  const currentHash = hashRefreshToken(request.refreshToken);
  const user = await findUserByRefreshTokenHash(currentHash);

  if (user === undefined) {
    return failureResponse(AuthMessage.InvalidRefreshToken);
  }

  if (user.isRefreshTokenExpired) {
    return failureResponse(AuthMessage.RefreshTokenExpired);
  }

  const tokens = await issueTokens(user);

  const replaced = await replaceRefreshToken({
    userId: user.id,
    currentHash,
    newHash: tokens.refreshTokenHash,
    lifetimeDays: getConfig().jwt.refreshTokenLifetimeDays,
  });

  if (!replaced) {
    return failureResponse(AuthMessage.InvalidRefreshToken);
  }

  return successResponse(tokens.response);
}
