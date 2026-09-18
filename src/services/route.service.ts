import {
  findAllRoutes,
  findRouteById,
  deleteRoute as deleteRouteRow,
  updateRoute as updateRouteRow,
  insertRoute,
} from '../repositories/route.repository.ts';
import { successResponse } from '../shared/api-response.ts';
import type { ApiResponse } from '../shared/api-response.ts';
import { NotFoundError } from '../shared/errors.ts';
import type { CreateRoute, UpdateRoute } from '../validation/route.validation.ts';
import type { RouteSummary } from '../repositories/route.repository.ts';

export async function createRoute(input: CreateRoute): Promise<ApiResponse<RouteSummary>> {
  const created = await insertRoute(input);
  return successResponse(created, 'Route created successfully');
}

export async function getAllRoutes(): Promise<ApiResponse<RouteSummary[]>> {
  const routes = await findAllRoutes();
  return successResponse(routes);
}

export async function getRouteById(id: number): Promise<ApiResponse<RouteSummary>> {
  const route = await findRouteById(id);
  if (route === undefined) {
    throw new NotFoundError(`Route ${id} was not found`);
  }
  return successResponse(route);
}

export async function updateRoute(input: UpdateRoute): Promise<ApiResponse<RouteSummary>> {
  const updated = await updateRouteRow(input);
  if (updated === undefined) {
    throw new NotFoundError(`Route ${input.id} was not found`);
  }
  return successResponse(updated, 'Route updated successfully');
}

export async function deleteRoute(id: number): Promise<ApiResponse<null>> {
  const deleted = await deleteRouteRow(id);
  if (!deleted) {
    throw new NotFoundError(`Route ${id} was not found`);
  }
  return successResponse(null, 'Route deleted successfully');
}
