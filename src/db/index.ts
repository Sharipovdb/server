export { closeDb, db, isDatabaseReachable } from './client.ts';
export type { Database, Executor } from './client.ts';
export {
  countNotDeleted,
  findNotDeletedById,
  notDeleted,
  selectNotDeleted,
  softDelete,
  softDeleteById,
} from './soft-delete.ts';
export type { SoftDeletableTable } from './soft-delete.ts';
