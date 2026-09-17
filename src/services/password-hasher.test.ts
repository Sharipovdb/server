import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password-hasher.ts';

const PASSWORD = 'Correct-Password-1';

describe('password hasher', () => {
  it('stores a bcrypt hash instead of the password', async () => {
    const hash = await hashPassword(PASSWORD);

    expect(hash).toMatch(/^\$2b\$12\$/);
    expect(hash).not.toContain(PASSWORD);
  });

  it('accepts the original password', async () => {
    const hash = await hashPassword(PASSWORD);

    await expect(verifyPassword(PASSWORD, hash)).resolves.toBe(true);
  });

  it('rejects a different password', async () => {
    const hash = await hashPassword(PASSWORD);

    await expect(verifyPassword('Wrong-Password-1', hash)).resolves.toBe(false);
  });

  it('rejects any password when the user has no stored hash', async () => {
    await expect(verifyPassword(PASSWORD, null)).resolves.toBe(false);
  });
});
