import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from '../app.ts';
import { getConfig } from '../config/index.ts';
import { closeDb } from '../db/index.ts';
import type { RouteSummary } from '../repositories/route.repository.ts';
import { createAccessToken } from '../services/token.service.ts';
import type { ApiResponse } from '../shared/api-response.ts';
import { RoleName } from '../shared/role-names.ts';

const ADD_PATH = '/api/Route/Add';
const GET_ALL_PATH = '/api/Route/GetAll';
const UPDATE_PATH = '/api/Route/Update';
const getByIdPath = (id: number): string => `/api/Route/GetById/${id}`;
const deletePath = (id: number): string => `/api/Route/Delete/${id}`;

let nextTestUserId = 1;

function tokenFor(roles: readonly RoleName[]): string {
  const id = nextTestUserId++;
  return createAccessToken(
    { id, userName: `test.${id}`, email: null, phoneNumber: null, telegramId: null, roles },
    getConfig().jwt,
  );
}

const ADMIN_TOKEN = tokenFor([RoleName.Admin]);
const WORKER_TOKEN = tokenFor([RoleName.Worker]);

afterAll(closeDb);

type Method = 'get' | 'post' | 'put' | 'delete';

function authed(method: Method, path: string, token?: string) {
  const call = request(app)[method](path);
  return token === undefined ? call : call.set('Authorization', `Bearer ${token}`);
}

async function createTestRoute(
  overrides: Partial<{ name: string; distanceKm: number }> = {},
): Promise<ApiResponse<RouteSummary>> {
  const response = await authed('post', ADD_PATH, ADMIN_TOKEN).send({
    name: overrides.name ?? `Route ${Date.now()}-${Math.random()}`,
    distanceKm: overrides.distanceKm ?? 12.5,
  });
  return response.body as ApiResponse<RouteSummary>;
}

describe('POST /api/Route/Add', () => {
  it('rejects a request without a token with 401', async () => {
    const response = await authed('post', ADD_PATH).send({ name: 'Test Route', distanceKm: 5 });
    expect(response.status).toBe(401);
  });

  it('rejects a Worker with 403', async () => {
    const response = await authed('post', ADD_PATH, WORKER_TOKEN).send({
      name: 'Test Route',
      distanceKm: 5,
    });
    expect(response.status).toBe(403);
  });

  it('rejects a body missing required fields with 400', async () => {
    const response = await authed('post', ADD_PATH, ADMIN_TOKEN).send({});
    expect(response.status).toBe(400);
  });

  it('creates a route and returns id, name and distanceKm', async () => {
    const response = await authed('post', ADD_PATH, ADMIN_TOKEN).send({
      name: 'Depot Loop',
      distanceKm: 18.4,
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      isSuccess: true,
      statusCode: 200,
      message: 'Route created successfully',
      data: { name: 'Depot Loop', distanceKm: 18.4 },
    });
    expect(response.body.data.id).toEqual(expect.any(Number));
  });
});

describe('GET /api/Route/GetById/:id', () => {
  it('rejects a request without a token with 401', async () => {
    const response = await authed('get', getByIdPath(1));
    expect(response.status).toBe(401);
  });

  it('returns 404 for a route that does not exist', async () => {
    const response = await authed('get', getByIdPath(999_999), ADMIN_TOKEN);
    expect(response.status).toBe(404);
  });

  it('rejects a non-numeric id with 400', async () => {
    const response = await authed('get', '/api/Route/GetById/abc', ADMIN_TOKEN);
    expect(response.status).toBe(400);
  });

  it('returns a previously created route to any authenticated role', async () => {
    const created = await createTestRoute({ name: 'Night Shift', distanceKm: 7.2 });

    const response = await authed('get', getByIdPath(created.data!.id), WORKER_TOKEN);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(created.data);
  });
});

describe('GET /api/Route/GetAll', () => {
  it('includes a previously created route', async () => {
    const created = await createTestRoute();

    const response = await authed('get', GET_ALL_PATH, WORKER_TOKEN);

    expect(response.status).toBe(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: created.data!.id })]),
    );
  });
});

describe('PUT /api/Route/Update', () => {
  it('rejects a Worker with 403', async () => {
    const created = await createTestRoute();

    const response = await authed('put', UPDATE_PATH, WORKER_TOKEN).send({
      id: created.data!.id,
      name: 'Renamed',
      distanceKm: 1,
    });

    expect(response.status).toBe(403);
  });

  it('updates an existing route', async () => {
    const created = await createTestRoute();

    const response = await authed('put', UPDATE_PATH, ADMIN_TOKEN).send({
      id: created.data!.id,
      name: 'Renamed Route',
      distanceKm: 99,
    });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ name: 'Renamed Route', distanceKm: 99 });
  });

  it('returns 404 for a route that does not exist', async () => {
    const response = await authed('put', UPDATE_PATH, ADMIN_TOKEN).send({
      id: 999_999,
      name: 'Ghost',
      distanceKm: 1,
    });

    expect(response.status).toBe(404);
  });
});

describe('DELETE /api/Route/Delete/:id', () => {
  it('soft-deletes a route so it disappears from GetById', async () => {
    const created = await createTestRoute();

    const deleteResponse = await authed('delete', deletePath(created.data!.id), ADMIN_TOKEN);
    expect(deleteResponse.status).toBe(200);

    const getResponse = await authed('get', getByIdPath(created.data!.id), ADMIN_TOKEN);
    expect(getResponse.status).toBe(404);
  });

  it('returns 404 when deleting an already-deleted route', async () => {
    const created = await createTestRoute();
    await authed('delete', deletePath(created.data!.id), ADMIN_TOKEN);

    const response = await authed('delete', deletePath(created.data!.id), ADMIN_TOKEN);
    expect(response.status).toBe(404);
  });
});
