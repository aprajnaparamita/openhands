import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller.js';
import { Routes } from '../interfaces/routes.interface.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

export class ChatRoute implements Routes {
  public path = '/chat';
  public router: Router = Router();
  public chatController = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/message`,
      AuthMiddleware,
      this.chatController.sendMessage
    );
  }
}
