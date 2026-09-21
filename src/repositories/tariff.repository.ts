import type { Executor } from '../db/client.ts';
import { db } from '../db/client.ts';
import { tariffs } from '../db/schema/tariffs.ts';
import { findNotDeletedById, notDeleted, softDeleteById } from '../db/soft-delete.ts';
import type { CreateTariff, UpdateTariff } from '../validation/tariff.validation.ts';
import type { Pagination } from '../validation/pagination.ts';
import type { PaginatedResult } from '../shared/paginated-result.ts';
import { and, eq, count } from 'drizzle-orm';

export interface TariffSummary {
  readonly id: number;
  readonly name: string;
  readonly amountPerLeg: number;
}

function toSummary(tariff: { id: number; name: string; amountPerLeg: string }): TariffSummary {
  return { id: tariff.id, name: tariff.name, amountPerLeg: Number(tariff.amountPerLeg) };
}

const TARIFF_SUMMARY_COLUMNS = {
  id: tariffs.id,
  name: tariffs.name,
  amountPerLeg: tariffs.amountPerLeg,
};

export async function insertTariff(
  tariff: CreateTariff,
  executor: Executor = db,
): Promise<TariffSummary> {
  const [created] = await executor
    .insert(tariffs)
    .values({
      name: tariff.name,
      amountPerLeg: tariff.amountPerLeg.toString(),
      createdAt: new Date().toISOString(),
    })
    .returning(TARIFF_SUMMARY_COLUMNS);

  if (created === undefined) {
    throw new Error('Tariff was not created');
  }
  return toSummary(created);
}

export async function findAllTariffs(
  { index, size }: Pagination,
  executor: Executor = db,
): Promise<PaginatedResult<TariffSummary>> {
  const [rows, countRows] = await Promise.all([
    executor
      .select(TARIFF_SUMMARY_COLUMNS)
      .from(tariffs)
      .where(notDeleted(tariffs))
      .limit(size)
      .offset(index * size),
    executor.select({ totalCount: count() }).from(tariffs).where(notDeleted(tariffs)),
  ]);

  const totalCount = countRows[0]?.totalCount ?? 0;

  return { items: rows.map(toSummary), totalCount };
}

export async function findTariffById(
  id: number,
  executor: Executor = db,
): Promise<TariffSummary | undefined> {
  const tariff = await findNotDeletedById(tariffs, id, executor);
  return tariff === undefined ? undefined : toSummary(tariff);
}

export async function updateTariff(
  input: UpdateTariff,
  executor: Executor = db,
): Promise<TariffSummary | undefined> {
  const [updated] = await executor
    .update(tariffs)
    .set({
      name: input.name,
      amountPerLeg: input.amountPerLeg.toString(),
      updatedAt: new Date().toISOString(),
    })
    .where(and(notDeleted(tariffs), eq(tariffs.id, input.id)))
    .returning(TARIFF_SUMMARY_COLUMNS);

  return updated === undefined ? undefined : toSummary(updated);
}

export async function deleteTariff(id: number, executor: Executor = db): Promise<boolean> {
  return softDeleteById(tariffs, id, executor);
}
