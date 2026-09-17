import type { Request, Response } from 'express';
import { login, refresh } from '../services/auth.service.ts';
import { parseLoginRequest, parseRefreshTokenRequest } from '../validation/auth.validation.ts';

const HTTP_OK = 200;

export async function postLogin(req: Request, res: Response): Promise<void> {
  const response = await login(parseLoginRequest(req.body));

  res.status(HTTP_OK).json(response);
}

export async function postRefresh(req: Request, res: Response): Promise<void> {
  const response = await refresh(parseRefreshTokenRequest(req.body));

  res.status(HTTP_OK).json(response);
}
