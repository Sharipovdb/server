import { describe, expect, it } from 'vitest';
import { BadRequestError } from '../shared/errors.ts';
import { parseLoginRequest, parseRefreshTokenRequest } from './auth.validation.ts';

describe('parseLoginRequest', () => {
  it('reads userName and password', () => {
    expect(parseLoginRequest({ userName: 'admin', password: 'secret' })).toEqual({
      userName: 'admin',
      password: 'secret',
    });
  });

  it('matches field names case-insensitively, as ASP.NET model binding does', () => {
    expect(parseLoginRequest({ UserName: 'admin', PASSWORD: 'secret' })).toEqual({
      userName: 'admin',
      password: 'secret',
    });
  });

  it.each([undefined, null, 'admin', [], {}])('rejects the body %j', (body) => {
    expect(() => parseLoginRequest(body)).toThrow(BadRequestError);
  });

  it('names every missing field with the ASP.NET message', () => {
    expect(() => parseLoginRequest({})).toThrow(
      'The UserName field is required. The Password field is required.',
    );
  });

  it.each(['', '   ', 42, true, null])('treats the userName %j as missing', (userName) => {
    expect(() => parseLoginRequest({ userName, password: 'secret' })).toThrow(
      'The UserName field is required.',
    );
  });
});

describe('parseRefreshTokenRequest', () => {
  it('reads refreshToken', () => {
    expect(parseRefreshTokenRequest({ refreshToken: 'token' })).toEqual({ refreshToken: 'token' });
  });

  it('rejects a body without refreshToken', () => {
    expect(() => parseRefreshTokenRequest({})).toThrow('The RefreshToken field is required.');
  });
});
