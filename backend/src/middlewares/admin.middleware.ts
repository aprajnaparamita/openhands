import { Request, Response, NextFunction } from 'express';
import { UserType } from '../entities/user.entity';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (user.role !== UserType.ADMIN) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};
