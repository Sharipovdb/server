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
