import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { adminMiddleware } from '../middlewares/admin.middleware';
import { Routes } from '../interfaces/routes.interface';

export class AdminRoute implements Routes {
  public path = '/admin';
  public router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Apply auth and admin middleware to all routes
    this.router.use(AuthMiddleware);
    this.router.use(adminMiddleware);

    this.router.get(`${this.path}/stats`, AdminController.getStats);
    this.router.get(`${this.path}/users`, AdminController.getUsers);
    this.router.post(`${this.path}/users/:id/ban`, AdminController.banUser);
    this.router.post(`${this.path}/users/:id/unban`, AdminController.unbanUser);
    this.router.get(`${this.path}/disputes`, AdminController.getDisputes);
    this.router.post(`${this.path}/disputes/:id/resolve`, AdminController.resolveDispute);
  }
}
