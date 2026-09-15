import { Router } from 'express';
import { postLogin, postRefresh } from '../controllers/auth.controller.ts';

export const authRouter: Router = Router();

authRouter.post('/login', postLogin);
authRouter.post('/refresh', postRefresh);
