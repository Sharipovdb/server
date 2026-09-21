export interface PaginatedResult<T> {
  readonly items: T[];
  readonly totalCount: number;
}
