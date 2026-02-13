import { NextFunction, Request, Response } from 'express';
import { container } from 'tsyringe';
import { ChatService } from '../services/chat.service.js';
import { RequestWithUser } from '../interfaces/auth.interface.js';

export class ChatController {
  private chatService = container.resolve(ChatService);

  public sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userReq = req as RequestWithUser;
      const { commissionId, content } = req.body;
      
      await this.chatService.sendMessage(userReq.user.id, commissionId, content);
      
      res.status(200).json({ message: 'Message sent' });
    } catch (error) {
      next(error);
    }
  };
}
