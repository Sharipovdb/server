import { and, eq } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { AnyPgColumn, PgTable, PgUpdateSetSource } from 'drizzle-orm/pg-core';
import { db } from './client.ts';
import type { Executor } from './client.ts';

export type SoftDeletableTable = PgTable & {
  readonly id: AnyPgColumn;
  readonly isDeleted: AnyPgColumn;
  readonly updatedAt: AnyPgColumn;
};

export function notDeleted(table: SoftDeletableTable): SQL {
  return eq(table.isDeleted, false);
}

export function selectNotDeleted<TTable extends SoftDeletableTable>(
  table: TTable,
  where?: SQL,
  executor: Executor = db,
) {
  return executor
    .select()
    .from<TTable>(table as never)
    .where(and(notDeleted(table), where));
}

export async function findNotDeletedById<TTable extends SoftDeletableTable>(
  table: TTable,
  id: number,
  executor: Executor = db,
) {
  const [row] = await selectNotDeleted(table, eq(table.id, id), executor).limit(1);
  return row;
}

export async function countNotDeleted(
  table: SoftDeletableTable,
  where?: SQL,
  executor: Executor = db,
): Promise<number> {
  return await executor.$count(table, and(notDeleted(table), where));
}

export async function softDelete(
  table: SoftDeletableTable,
  where: SQL,
  executor: Executor = db,
): Promise<number> {
  const values: PgUpdateSetSource<SoftDeletableTable> = {
    isDeleted: true,
    updatedAt: new Date().toISOString(),
  };

  const deleted = await executor
    .update(table)
    .set(values)
    .where(and(notDeleted(table), where))
    .returning({ id: table.id });

  return deleted.length;
}

export async function softDeleteById(
  table: SoftDeletableTable,
  id: number,
  executor: Executor = db,
): Promise<boolean> {
  return (await softDelete(table, eq(table.id, id), executor)) > 0;
}
