export interface ApiResponse<TData> {
  readonly isSuccess: boolean;
  readonly statusCode: number;
  readonly message: string | null;
  readonly data: TData | null;
}

const OK = 200;
const BAD_REQUEST = 400;

export function successResponse<TData>(
  data: TData,
  message: string | null = null,
  statusCode = OK,
): ApiResponse<TData> {
  return { isSuccess: true, statusCode, message, data };
}

export function failureResponse<TData = never>(
  message: string,
  statusCode = BAD_REQUEST,
): ApiResponse<TData> {
  return { isSuccess: false, statusCode, message, data: null };
}
