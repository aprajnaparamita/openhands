import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { CommissionsService } from '../services/commissions.service.js';
import { StorageService } from '../services/storage.service.js';
import { RequestWithUser } from '../interfaces/auth.interface.js';

export class CommissionsController {
  private commissionsService = container.resolve(CommissionsService);
  private storageService = container.resolve(StorageService);

  public createCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionData = { ...req.body, requesterId: userReq.user.id };
      const createCommissionData = await this.commissionsService.createCommission(commissionData);
      res.status(201).json({ data: createCommissionData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  public acceptCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionId = req.params.id as string;
      const providerId = userReq.user.id;
      const updatedCommission = await this.commissionsService.acceptCommission(commissionId, providerId);
      res.status(200).json({ data: updatedCommission, message: 'accepted' });
    } catch (error) {
      next(error);
    }
  };

  public deliverWork = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionId = req.params.id as string;
      const { artworkUrl, hash } = req.body;
      const updatedCommission = await this.commissionsService.deliverWork(commissionId, userReq.user.id, artworkUrl, hash);
      res.status(200).json({ data: updatedCommission, message: 'delivered' });
    } catch (error) {
      next(error);
    }
  };

  public completeCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionId = req.params.id as string;
      const updatedCommission = await this.commissionsService.completeCommission(commissionId, userReq.user.id);
      res.status(200).json({ data: updatedCommission, message: 'completed' });
    } catch (error) {
      next(error);
    }
  };

  public getChatToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionId = req.params.id as string;
      const token = await this.commissionsService.getChatToken(commissionId, userReq.user.id);
      res.status(200).json({ data: { token }, message: 'token generated' });
    } catch (error) {
      next(error);
    }
  };

  public getUploadSignature = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signatureData = this.storageService.generateUploadSignature();
      res.status(200).json({ data: signatureData, message: 'signature generated' });
    } catch (error) {
      next(error);
    }
  };

  public getCommissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissions = await this.commissionsService.getUserCommissions(userReq.user.id);
      res.status(200).json({ data: commissions, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public getCommissionById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commissionId = req.params.id as string;
      const commission = await this.commissionsService.findById(commissionId);
      res.status(200).json({ data: commission, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public getAvailableCommissions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commissions = await this.commissionsService.getAvailableCommissions();
      res.status(200).json({ data: commissions, message: 'found' });
    } catch (error) {
      next(error);
    }
  };

  public fundCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionId = req.params.id as string;
      const updatedCommission = await this.commissionsService.fundCommission(commissionId, userReq.user.id);
      res.status(200).json({ data: updatedCommission, message: 'funded' });
    } catch (error) {
      next(error);
    }
  };

  public reviewCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const commissionId = req.params.id as string;
      const { score, review } = req.body;
      const updatedCommission = await this.commissionsService.reviewCommission(commissionId, userReq.user.id, { score, review });
      res.status(200).json({ data: updatedCommission, message: 'reviewed' });
    } catch (error) {
      next(error);
    }
  };
}
