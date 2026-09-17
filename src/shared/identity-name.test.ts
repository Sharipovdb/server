import { describe, expect, it } from 'vitest';
import { normalizeIdentityName } from './identity-name.ts';

describe('normalizeIdentityName', () => {
  it('uppercases the name like ASP.NET Identity lookups', () => {
    expect(normalizeIdentityName('driver.Lead')).toBe('DRIVER.LEAD');
  });
});
