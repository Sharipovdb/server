export interface LoginRequest {
  readonly userName: string;
  readonly password: string;
}

export interface RefreshTokenRequest {
  readonly refreshToken: string;
}

export interface TokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
}

export interface AuthenticatedUser {
  readonly id: number;
  readonly userName: string;
  readonly roles: readonly string[];
}
