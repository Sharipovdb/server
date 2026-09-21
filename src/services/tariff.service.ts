import {
  findAllTariffs,
  findTariffById,
  deleteTariff as deleteTariffRow,
  updateTariff as updateTariffRow,
  insertTariff,
} from '../repositories/tariff.repository.ts';
import { successResponse } from '../shared/api-response.ts';
import type { ApiResponse } from '../shared/api-response.ts';
import { NotFoundError } from '../shared/errors.ts';
import type { CreateTariff, UpdateTariff } from '../validation/tariff.validation.ts';
import type { TariffSummary } from '../repositories/tariff.repository.ts';
import type { Pagination } from '../validation/pagination.ts';
import type { PaginatedResult } from '../shared/paginated-result.ts';

export async function createTariff(input: CreateTariff): Promise<ApiResponse<TariffSummary>> {
  const created = await insertTariff(input);
  return successResponse(created, 'Tariff created successfully');
}

export async function getAllTariffs(
  pagination: Pagination,
): Promise<ApiResponse<PaginatedResult<TariffSummary>>> {
  const tariffs = await findAllTariffs(pagination);
  return successResponse(tariffs);
}

export async function getTariffById(id: number): Promise<ApiResponse<TariffSummary>> {
  const tariff = await findTariffById(id);

  if (tariff === undefined) {
    throw new NotFoundError(`Tariff ${id} was not found`);
  }

  return successResponse(tariff);
}

export async function updateTariff(input: UpdateTariff): Promise<ApiResponse<TariffSummary>> {
  const updated = await updateTariffRow(input);

  if (updated === undefined) {
    throw new NotFoundError(`Tariff ${input.id} was not found`);
  }

  return successResponse(updated, 'Tariff updated successfully');
}

export async function deleteTariff(id: number): Promise<ApiResponse<null>> {
  const deleted = await deleteTariffRow(id);

  if (!deleted) {
    throw new NotFoundError(`Tariff ${id} was not found`);
  }

  return successResponse(null, 'Tariff deleted successfully');
}
