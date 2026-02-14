import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { AdminService } from '../services/admin.service';

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const service = container.resolve(AdminService);
      const stats = await service.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUsers(req: Request, res: Response) {
    try {
      const service = container.resolve(AdminService);
      const users = await service.getUsers();
      res.json(users.map(u => u.toResponse()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async banUser(req: Request, res: Response) {
    try {
      const service = container.resolve(AdminService);
      const { id } = req.params;
      const user = await service.banUser(id as string);
      res.json(user.toResponse());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async unbanUser(req: Request, res: Response) {
    try {
      const service = container.resolve(AdminService);
      const { id } = req.params;
      const user = await service.unbanUser(id as string);
      res.json(user.toResponse());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getDisputes(req: Request, res: Response) {
    try {
      const service = container.resolve(AdminService);
      const disputes = await service.getDisputes();
      res.json(disputes.map(d => d.toResponse()));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async resolveDispute(req: Request, res: Response) {
    try {
      const service = container.resolve(AdminService);
      const { id } = req.params;
      const { resolution, txSignature } = req.body;
      
      if (!['refund', 'pay_provider'].includes(resolution)) {
        return res.status(400).json({ message: 'Invalid resolution' });
      }

      const commission = await service.resolveDispute(id as string, resolution, txSignature);
      res.json(commission.toResponse());
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
