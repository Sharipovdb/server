import type { Request, Response } from 'express';
import {
  createRoute,
  deleteRoute,
  getAllRoutes,
  getRouteById,
  updateRoute,
} from '../services/route.service.ts';
import type { RequestWithBody } from '../shared/http.ts';
import type { CreateRoute, UpdateRoute } from '../validation/route.validation.ts';
import type { Pagination } from '../validation/pagination.ts';

const HTTP_OK = 200;

export async function postAddRoute(
  req: RequestWithBody<CreateRoute>,
  res: Response,
): Promise<void> {
  const response = await createRoute(req.body);
  res.status(HTTP_OK).json(response);
}

export async function getRoute(req: Request, res: Response): Promise<void> {
  const response = await getRouteById(Number(req.params.id));
  res.status(HTTP_OK).json(response);
}

export async function getRoutes(req: Request, res: Response): Promise<void> {
  const response = await getAllRoutes(req.validatedQuery as Pagination);
  res.status(HTTP_OK).json(response);
}

export async function putUpdateRoute(
  req: RequestWithBody<UpdateRoute>,
  res: Response,
): Promise<void> {
  const response = await updateRoute(req.body);
  res.status(HTTP_OK).json(response);
}

export async function deleteRouteById(req: Request, res: Response): Promise<void> {
  const response = await deleteRoute(Number(req.params.id));
  res.status(HTTP_OK).json(response);
}
