import { describe, expect, it } from 'vitest';
import { BadRequestError } from './errors.ts';

describe('BadRequestError', () => {
  it('carries HTTP status 400 for the error handler', () => {
    expect(new BadRequestError('Invalid body')).toMatchObject({
      status: 400,
      message: 'Invalid body',
    });
  });
});
