import type { Executor } from '../db/client.ts';
import { db } from '../db/client.ts';
import { routes } from '../db/schema/routes.ts';
import {
  findNotDeletedById,
  notDeleted,
  selectNotDeleted,
  softDeleteById,
} from '../db/soft-delete.ts';
import type { CreateRoute, UpdateRoute } from '../validation/route.validation.ts';
import { and, eq } from 'drizzle-orm';

export interface RouteSummary {
  readonly id: number;
  readonly name: string;
  readonly distanceKm: number;
}

function toSummary(route: { id: number; name: string; distanceKm: number }): RouteSummary {
  return { id: route.id, name: route.name, distanceKm: route.distanceKm };
}

const ROUTE_SUMMARY_COLUMNS = {
  id: routes.id,
  name: routes.name,
  distanceKm: routes.distanceKm,
};

export async function insertRoute(
  route: CreateRoute,
  executor: Executor = db,
): Promise<RouteSummary> {
  const [created] = await executor
    .insert(routes)
    .values({ ...route, createdAt: new Date().toISOString() })
    .returning(ROUTE_SUMMARY_COLUMNS);

  if (created === undefined) {
    throw new Error('Route was not created');
  }
  return created;
}

export async function findAllRoutes(executor: Executor = db): Promise<RouteSummary[]> {
  const rows = await selectNotDeleted(routes, undefined, executor);
  return rows.map(toSummary);
}

export async function findRouteById(
  id: number,
  executor: Executor = db,
): Promise<RouteSummary | undefined> {
  const route = await findNotDeletedById(routes, id, executor);
  return route === undefined ? undefined : toSummary(route);
}

export async function updateRoute(
  input: UpdateRoute,
  executor: Executor = db,
): Promise<RouteSummary | undefined> {
  const [updated] = await executor
    .update(routes)
    .set({ name: input.name, distanceKm: input.distanceKm, updatedAt: new Date().toISOString() })
    .where(and(notDeleted(routes), eq(routes.id, input.id)))
    .returning(ROUTE_SUMMARY_COLUMNS);

  return updated;
}

export async function deleteRoute(id: number, executor: Executor = db): Promise<boolean> {
  return softDeleteById(routes, id, executor);
}
