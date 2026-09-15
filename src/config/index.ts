import process from 'node:process';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export type NodeEnv = 'development' | 'production' | 'test';

export interface JwtSettings {
  readonly secret: string;
  readonly issuer: string;
  readonly audience: string;
  readonly accessTokenLifetimeMinutes: number;
  readonly refreshTokenLifetimeDays: number;
}

export interface AppConfig {
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly databaseUrl: string;
  readonly jwt: JwtSettings;
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
}

export interface SeedConfig {
  readonly admin: {
    readonly userName: string;
    readonly password: string;
  };
}

const APP_ENV_VARS = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_ISSUER',
  'JWT_AUDIENCE',
  'JWT_ACCESS_TOKEN_LIFETIME_MINUTES',
  'JWT_REFRESH_TOKEN_LIFETIME_DAYS',
] as const;

const SEED_ENV_VARS = ['SEED_ADMIN_USERNAME', 'SEED_ADMIN_PASSWORD'] as const;

const DATABASE_URL_PROTOCOLS = ['postgres:', 'postgresql:'];

const NODE_ENV_VALUES: readonly NodeEnv[] = ['development', 'production', 'test'];

const JWT_SECRET_MIN_LENGTH = 32;

let cached: AppConfig | null = null;

function readRequiredEnv<TName extends string>(names: readonly TName[]): Record<TName, string> {
  const values = {} as Record<TName, string>;
  const missing: string[] = [];

  for (const name of names) {
    const raw = process.env[name];

    if (raw === undefined || raw.trim() === '') {
      missing.push(name);
      continue;
    }

    values[name] = raw.trim();
  }

  if (missing.length > 0) {
    throw new ConfigError(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env and fill in the values.',
    );
  }

  return values;
}

function parseNodeEnv(raw: string): NodeEnv {
  const candidate = raw.toLowerCase();

  if (!NODE_ENV_VALUES.includes(candidate as NodeEnv)) {
    throw new ConfigError(
      `Invalid NODE_ENV value "${raw}". Expected one of: ${NODE_ENV_VALUES.join(', ')}.`,
    );
  }

  return candidate as NodeEnv;
}

function parsePort(raw: string): number {
  const port = Number(raw);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new ConfigError(`Invalid PORT value "${raw}". Expected an integer between 1 and 65535.`);
  }

  return port;
}

function parseDatabaseUrl(raw: string): string {
  let protocol: string;

  try {
    protocol = new URL(raw).protocol;
  } catch {
    throw new ConfigError(
      'Invalid DATABASE_URL value. Expected a postgresql:// connection string.',
    );
  }

  if (!DATABASE_URL_PROTOCOLS.includes(protocol)) {
    throw new ConfigError(
      `Invalid DATABASE_URL protocol "${protocol}". Expected one of: ${DATABASE_URL_PROTOCOLS.join(', ')}.`,
    );
  }

  return raw;
}

function parseJwtSecret(raw: string): string {
  if (raw.length < JWT_SECRET_MIN_LENGTH) {
    throw new ConfigError(
      `JWT_SECRET is too short. Use at least ${JWT_SECRET_MIN_LENGTH} characters.`,
    );
  }

  return raw;
}

function parsePositiveInteger(name: string, raw: string): number {
  const value = Number(raw);

  if (!Number.isInteger(value) || value < 1) {
    throw new ConfigError(`Invalid ${name} value "${raw}". Expected a positive integer.`);
  }

  return value;
}

function buildConfig(): AppConfig {
  const env = readRequiredEnv(APP_ENV_VARS);
  const nodeEnv = parseNodeEnv(env.NODE_ENV);

  return Object.freeze({
    nodeEnv,
    port: parsePort(env.PORT),
    databaseUrl: parseDatabaseUrl(env.DATABASE_URL),
    jwt: Object.freeze({
      secret: parseJwtSecret(env.JWT_SECRET),
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
      accessTokenLifetimeMinutes: parsePositiveInteger(
        'JWT_ACCESS_TOKEN_LIFETIME_MINUTES',
        env.JWT_ACCESS_TOKEN_LIFETIME_MINUTES,
      ),
      refreshTokenLifetimeDays: parsePositiveInteger(
        'JWT_REFRESH_TOKEN_LIFETIME_DAYS',
        env.JWT_REFRESH_TOKEN_LIFETIME_DAYS,
      ),
    }),
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
  });
}

export function getConfig(): AppConfig {
  cached ??= buildConfig();
  return cached;
}

export function getSeedConfig(): SeedConfig {
  const env = readRequiredEnv(SEED_ENV_VARS);

  return Object.freeze({
    admin: Object.freeze({
      userName: env.SEED_ADMIN_USERNAME,
      password: env.SEED_ADMIN_PASSWORD,
    }),
  });
}

export function resetConfigCache(): void {
  cached = null;
}
