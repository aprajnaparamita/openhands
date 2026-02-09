import type { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import { type UserCreateData } from '../entities/user.entity.js';
import { UsersService } from '../services/users.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

@injectable()
export class UsersController {
  constructor(@inject(UsersService) private readonly userService: UsersService) {}

  getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await this.userService.getAllUsers();
    const userResponses = users.map((user) => user.toResponse());

    res.json({ data: userResponses, message: 'findAll' });
  });

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = String(req.params.id);
    const user = await this.userService.getUserById(userId);

    res.json({ data: user.toResponse(), message: 'findById' });
  });

  createUser = asyncHandler(async (req: Request, res: Response) => {
    const userData: UserCreateData = req.body;
    const user = await this.userService.createUser(userData);

    res.status(201).json({ data: user.toResponse(), message: 'create' });
  });

  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = String(req.params.id);
    const updateData = req.body;
    const user = await this.userService.updateUser(userId, updateData);

    res.json({ data: user.toResponse(), message: 'update' });
  });

  resetUser = asyncHandler(async (req: Request, res: Response) => {
    // Only allow in development
    if (process.env.NODE_ENV !== 'development') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const userId: string = String(req.body.userId || (req as any).user?.id);
    if (!userId || userId === 'undefined') {
       res.status(400).json({ message: 'User ID required' });
       return;
    }

    await this.userService.resetUser(userId);
    res.json({ message: 'reset' });
  });

  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const userId: string = String(req.params.id);
    await this.userService.deleteUser(userId);

    res.status(204).json({ message: 'delete' });
  });
}
