import type { Request, Response } from 'express';

import {
  createTariff,
  deleteTariff,
  getAllTariffs,
  getTariffById,
  updateTariff,
} from '../services/tariff.service.ts';

import type { RequestWithBody } from '../shared/http.ts';

import type { CreateTariff, UpdateTariff } from '../validation/tariff.validation.ts';
import type { Pagination } from '../validation/pagination.ts';

const HTTP_OK = 200;

export async function postAddTariff(
  req: RequestWithBody<CreateTariff>,
  res: Response,
): Promise<void> {
  const response = await createTariff(req.body);
  res.status(HTTP_OK).json(response);
}

export async function getTariff(req: Request, res: Response): Promise<void> {
  const response = await getTariffById(Number(req.params.id));
  res.status(HTTP_OK).json(response);
}

export async function getTariffs(req: Request, res: Response): Promise<void> {
  const response = await getAllTariffs(req.validatedQuery as Pagination);
  res.status(HTTP_OK).json(response);
}

export async function putUpdateTariff(
  req: RequestWithBody<UpdateTariff>,
  res: Response,
): Promise<void> {
  const response = await updateTariff(req.body);
  res.status(HTTP_OK).json(response);
}

export async function deleteTariffById(req: Request, res: Response): Promise<void> {
  const response = await deleteTariff(Number(req.params.id));
  res.status(HTTP_OK).json(response);
}
