import { User } from '@entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';
import { AuthService } from '@services/auth.service';

import { CaptchaService } from '@services/captcha.service';

describe('AuthService (with UserMemoryRepository)', () => {
  let authService: AuthService;
  let userRepo: UsersRepository;
  let mockCaptchaService: CaptchaService;

  beforeEach(async () => {
    userRepo = new UsersRepository();
    mockCaptchaService = {
      verifyToken: jest.fn(),
    } as any;
    authService = new AuthService(userRepo, mockCaptchaService);
  });

  it('should login with a new wallet address (signup)', async () => {
    const walletAddress = 'wallet-new';
    
    // loginWithWallet returns { cookie, refreshCookie, user }
    const result = await authService.loginWithWallet(walletAddress);
    
    expect(result.user).toBeDefined();
    expect(result.user.walletAddress).toBe(walletAddress);
    expect(result.accessTokenCookie).toContain('Authorization=');
    expect(result.refreshTokenCookie).toContain('RefreshToken=');

    // Verify user is saved in repo
    const found = await userRepo.findByWalletAddress(walletAddress);
    expect(found).toBeDefined();
    expect(found?.refreshToken).toBeDefined(); // Refresh token should be hashed and saved
  });

  it('should login with an existing wallet address', async () => {
    const walletAddress = 'wallet-existing';
    // Create user first
    const existingUser = await User.create({ walletAddress });
    await userRepo.save(existingUser);

    const result = await authService.loginWithWallet(walletAddress);
    
    expect(result.user.id).toBe(existingUser.id);
    expect(result.user.walletAddress).toBe(walletAddress);
    
    // Verify refresh token is updated
    const found = await userRepo.findByWalletAddress(walletAddress);
    expect(found?.refreshToken).not.toBe(existingUser.refreshToken);
  });

  it('should successfully logout', async () => {
    const walletAddress = 'wallet-logout';
    const user = await User.create({ walletAddress });
    // Set a refresh token
    user.setRefreshToken('some-token');
    await userRepo.save(user);

    await authService.logout(user);

    const found = await userRepo.findByWalletAddress(walletAddress);
    expect(found?.refreshToken).toBeUndefined();
  });
});
