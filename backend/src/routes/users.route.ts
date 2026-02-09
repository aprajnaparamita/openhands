import { Router } from 'express';
import { injectable, inject } from 'tsyringe';
import { UsersController } from '../controllers/users.controller.js';
import { createUserSchema, updateUserSchema } from '../dtos/users.dto.js';
import { Routes } from '../interfaces/routes.interface.js';
import { ValidationMiddleware } from '../middlewares/validation.middleware.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

@injectable()
export class UsersRoute implements Routes {
  public router: Router = Router();
  public path = '/users';

  constructor(@inject(UsersController) private userController: UsersController) {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.userController.getUsers);
    this.router.get(`${this.path}/:id`, this.userController.getUserById);
    this.router.post(
      this.path,
      ValidationMiddleware(createUserSchema),
      this.userController.createUser,
    );
    this.router.put(
      `${this.path}/:id`,
      ValidationMiddleware(updateUserSchema),
      this.userController.updateUser,
    );
    this.router.post(
      `${this.path}/reset`,
      this.userController.resetUser,
    );
    this.router.delete(`${this.path}/:id`, this.userController.deleteUser);
  }
}
