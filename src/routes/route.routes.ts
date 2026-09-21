import { Router } from 'express';
import {
  deleteRouteById,
  getRoute,
  getRoutes,
  postAddRoute,
  putUpdateRoute,
} from '../controllers/route.controller.ts';
import { validateBody } from '../validation/validate-body.ts';
import { idParamsSchema } from '../validation/id.ts';
import { createRouteSchema, updateRouteSchema } from '../validation/route.validation.ts';
import { requireAuth, requireRole } from '../middleware/auth.middleware.ts';
import { RoleName } from '../shared/role-names.ts';
import { validateParams } from '../validation/validate-params.ts';
import { validateQuery } from '../validation/validate-query.ts';
import { paginationQuerySchema } from '../validation/pagination.ts';

export const routeRouter: Router = Router();

routeRouter.use(requireAuth);

routeRouter.get(
  '/GetAll',
  requireRole(RoleName.Admin, RoleName.RouteManager, RoleName.Accountant),
  validateQuery(paginationQuerySchema),
  getRoutes,
);
routeRouter.get(
  '/GetById/:id',
  requireRole(RoleName.Admin, RoleName.RouteManager, RoleName.Accountant),
  validateParams(idParamsSchema),
  getRoute,
);
routeRouter.post(
  '/Add',
  requireRole(RoleName.Admin, RoleName.RouteManager),
  validateBody(createRouteSchema),
  postAddRoute,
);
routeRouter.put(
  '/Update',
  requireRole(RoleName.Admin, RoleName.RouteManager),
  validateBody(updateRouteSchema),
  putUpdateRoute,
);
routeRouter.delete(
  '/Delete/:id',
  requireRole(RoleName.Admin, RoleName.RouteManager),
  validateParams(idParamsSchema),
  deleteRouteById,
);
