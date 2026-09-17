import { describe, expect, it } from 'vitest';
import { failureResponse, successResponse } from './api-response.ts';

describe('successResponse', () => {
  it('matches ApiResponse<T>.Success from C#', () => {
    expect(successResponse({ id: 1 }, 'Done')).toEqual({
      isSuccess: true,
      statusCode: 200,
      message: 'Done',
      data: { id: 1 },
    });
  });

  it('leaves the message empty when none is given', () => {
    expect(successResponse({ id: 1 }).message).toBeNull();
  });
});

describe('failureResponse', () => {
  it('matches ApiResponse<T>.Failure from C#', () => {
    expect(failureResponse('Something went wrong')).toEqual({
      isSuccess: false,
      statusCode: 400,
      message: 'Something went wrong',
      data: null,
    });
  });
});
