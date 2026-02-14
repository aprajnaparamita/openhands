import type { Request, Response, RequestHandler } from 'express';
import { injectable, inject } from 'tsyringe';
import { RequestWithUser } from '@interfaces/auth.interface';
import { AuthService } from '@services/auth.service';
import { asyncHandler } from '@utils/asyncHandler';

@injectable()
export class AuthController {
  constructor(@inject(AuthService) private readonly authService: AuthService) {}

  public logInWithWallet: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { walletAddress, captchaToken } = req.body;
    const { accessTokenCookie, refreshTokenCookie, user } = await this.authService.loginWithWallet(walletAddress, captchaToken);

    res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
    res.status(200).json({ data: user.toResponse(), message: 'loginWithWallet' });
  });

  public logOut: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userReq = req as RequestWithUser;
    const user = userReq.user;
    
    if (user) {
        await this.authService.logout(user);
    }

    res.setHeader('Set-Cookie', [
        'Authorization=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax',
        'RefreshToken=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax'
    ]);
    res.status(200).json({ message: 'logout' });
  });

  public refresh: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const refreshToken = req.cookies.RefreshToken;
      
      if (!refreshToken) {
          res.status(401).json({ message: 'Refresh token missing' });
          return;
      }

      const { accessTokenCookie, refreshTokenCookie, user } = await this.authService.refresh(refreshToken);

      res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);
      res.status(200).json({ data: user.toResponse(), message: 'refresh' });
  });

  public getMe: RequestHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userReq = req as RequestWithUser;
    const user = userReq.user;

    if (!user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    res.status(200).json({ data: user.toResponse(), message: 'getMe' });
  });
}
