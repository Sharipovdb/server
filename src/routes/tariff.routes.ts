import { Router } from 'express';

import {
  deleteTariffById,
  getTariff,
  getTariffs,
  postAddTariff,
  putUpdateTariff,
} from '../controllers/tariff.controller.ts';

import { validateBody } from '../validation/validate-body.ts';
import { idParamsSchema } from '../validation/id.ts';
import { createTariffSchema, updateTariffSchema } from '../validation/tariff.validation.ts';

import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { RoleName } from '../shared/role-names.ts';
import { validateParams } from '../validation/validate-params.ts';
import { validateQuery } from '../validation/validate-query.ts';
import { paginationQuerySchema } from '../validation/pagination.ts';

export const tariffRouter: Router = Router();

tariffRouter.use(requireAuth);

tariffRouter.get(
  '/GetAll',
  requireRole(RoleName.Admin, RoleName.RouteManager, RoleName.Accountant),
  validateQuery(paginationQuerySchema),
  getTariffs,
);

tariffRouter.get(
  '/GetById/:id',
  requireRole(RoleName.Admin, RoleName.RouteManager, RoleName.Accountant),
  validateParams(idParamsSchema),
  getTariff,
);

tariffRouter.post(
  '/Add',
  requireRole(RoleName.Admin, RoleName.RouteManager),
  validateBody(createTariffSchema),
  postAddTariff,
);

tariffRouter.put(
  '/Update',
  requireRole(RoleName.Admin, RoleName.RouteManager),
  validateBody(updateTariffSchema),
  putUpdateTariff,
);

tariffRouter.delete(
  '/Delete/:id',
  requireRole(RoleName.Admin, RoleName.RouteManager),
  validateParams(idParamsSchema),
  deleteTariffById,
);
