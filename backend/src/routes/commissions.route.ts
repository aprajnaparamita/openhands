import { Router } from 'express';
import { CommissionsController } from '../controllers/commissions.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { Routes } from '../interfaces/routes.interface.js';

export class CommissionsRoute implements Routes {
  public path = '/commissions';
  public router: Router = Router();
  public commissionsController = new CommissionsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, AuthMiddleware, this.commissionsController.createCommission);
    this.router.get(`${this.path}`, AuthMiddleware, this.commissionsController.getCommissions);
    this.router.get(`${this.path}/upload-signature`, AuthMiddleware, this.commissionsController.getUploadSignature);
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.commissionsController.getCommissionById);
    this.router.post(`${this.path}/:id/accept`, AuthMiddleware, this.commissionsController.acceptCommission);
    this.router.post(`${this.path}/:id/deliver`, AuthMiddleware, this.commissionsController.deliverWork);
    this.router.post(`${this.path}/:id/complete`, AuthMiddleware, this.commissionsController.completeCommission);
    this.router.get(`${this.path}/:id/chat-token`, AuthMiddleware, this.commissionsController.getChatToken);
  }
}
