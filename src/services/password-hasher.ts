import bcrypt from 'bcrypt';

const BCRYPT_COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export function verifyPassword(password: string, passwordHash: string | null): Promise<boolean> {
  if (passwordHash === null) {
    return Promise.resolve(false);
  }

  return bcrypt.compare(password, passwordHash);
}
