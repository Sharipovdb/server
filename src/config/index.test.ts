import process from 'node:process';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ConfigError, getConfig, getSeedConfig, resetConfigCache } from './index.ts';

const VALID_ENV = {
  NODE_ENV: 'test',
  PORT: '3000',
  DATABASE_URL: 'postgresql://user:password@localhost:5432/crewmove_node_test',
  JWT_SECRET: 'x'.repeat(32),
  JWT_ISSUER: 'test-issuer',
  JWT_AUDIENCE: 'test-audience',
  JWT_ACCESS_TOKEN_LIFETIME_MINUTES: '15',
  JWT_REFRESH_TOKEN_LIFETIME_DAYS: '7',
  SEED_ADMIN_USERNAME: 'admin',
  SEED_ADMIN_PASSWORD: 'Admin123!',
};

let originalEnv: NodeJS.ProcessEnv;

beforeEach(() => {
  originalEnv = process.env;
  process.env = { ...VALID_ENV };
  resetConfigCache();
});

afterEach(() => {
  process.env = originalEnv;
  resetConfigCache();
});

describe('getConfig', () => {
  it('reads the JWT settings', () => {
    expect(getConfig().jwt).toEqual({
      secret: VALID_ENV.JWT_SECRET,
      issuer: 'test-issuer',
      audience: 'test-audience',
      accessTokenLifetimeMinutes: 15,
      refreshTokenLifetimeDays: 7,
    });
  });

  it('names every missing JWT variable', () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_ISSUER;

    expect(() => getConfig()).toThrow('JWT_SECRET, JWT_ISSUER');
  });

  it('rejects a JWT secret shorter than 32 characters', () => {
    process.env.JWT_SECRET = 'x'.repeat(31);

    expect(() => getConfig()).toThrow(ConfigError);
  });

  it.each(['0', '-1', '1.5', 'fifteen'])('rejects the token lifetime "%s"', (lifetime) => {
    process.env.JWT_ACCESS_TOKEN_LIFETIME_MINUTES = lifetime;

    expect(() => getConfig()).toThrow('JWT_ACCESS_TOKEN_LIFETIME_MINUTES');
  });

  it('does not require the seed variables to start the application', () => {
    delete process.env.SEED_ADMIN_USERNAME;
    delete process.env.SEED_ADMIN_PASSWORD;

    expect(() => getConfig()).not.toThrow();
  });
});

describe('getSeedConfig', () => {
  it('reads the administrator credentials', () => {
    expect(getSeedConfig()).toEqual({ admin: { userName: 'admin', password: 'Admin123!' } });
  });

  it('names every missing seed variable', () => {
    delete process.env.SEED_ADMIN_USERNAME;
    delete process.env.SEED_ADMIN_PASSWORD;

    expect(() => getSeedConfig()).toThrow('SEED_ADMIN_USERNAME, SEED_ADMIN_PASSWORD');
  });
});
