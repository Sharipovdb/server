import process from 'node:process';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

export type NodeEnv = 'development' | 'production' | 'test';

export interface AppConfig {
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly isProduction: boolean;
  readonly isDevelopment: boolean;
}

const REQUIRED_ENV_VARS = ['NODE_ENV', 'PORT'] as const;

type RequiredEnvVar = (typeof REQUIRED_ENV_VARS)[number];

const NODE_ENV_VALUES: readonly NodeEnv[] = ['development', 'production', 'test'];

let cached: AppConfig | null = null;

function readRequiredEnv(): Record<RequiredEnvVar, string> {
  const values = {} as Record<RequiredEnvVar, string>;
  const missing: string[] = [];

  for (const name of REQUIRED_ENV_VARS) {
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

function buildConfig(): AppConfig {
  const env = readRequiredEnv();
  const nodeEnv = parseNodeEnv(env.NODE_ENV);

  return Object.freeze({
    nodeEnv,
    port: parsePort(env.PORT),
    isProduction: nodeEnv === 'production',
    isDevelopment: nodeEnv === 'development',
  });
}

export function getConfig(): AppConfig {
  cached ??= buildConfig();
  return cached;
}

export function resetConfigCache(): void {
  cached = null;
}
