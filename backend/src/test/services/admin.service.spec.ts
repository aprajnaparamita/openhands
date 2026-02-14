import 'reflect-metadata';
import { container } from 'tsyringe';
import { AdminService } from '../../services/admin.service';
import { MongooseUsersRepository } from '../../repositories/mongoose/users.repository';
import { MongooseCommissionsRepository } from '../../repositories/mongoose/commissions.repository';
import { User, UserType } from '../../entities/user.entity';
import { Commission, CommissionStatus } from '../../entities/commission.entity';

describe('AdminService', () => {
  let adminService: AdminService;
  let mockUsersRepo: jest.Mocked<MongooseUsersRepository>;
  let mockCommissionsRepo: jest.Mocked<MongooseCommissionsRepository>;

  beforeEach(() => {
    mockUsersRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockCommissionsRepo = {
      getStats: jest.fn(),
      findDisputed: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    container.registerInstance(MongooseUsersRepository, mockUsersRepo);
    container.registerInstance(MongooseCommissionsRepository, mockCommissionsRepo);
    
    adminService = container.resolve(AdminService);
  });

  afterEach(() => {
    container.clearInstances();
  });

  describe('getDashboardStats', () => {
    it('should return aggregated stats', async () => {
      const users = [
        { role: UserType.ARTIST, isBanned: false },
        { role: UserType.REQUESTER, isBanned: true },
      ] as User[];

      const commissionStats = {
        totalVolume: 1000,
        completedCount: 5,
        disputeCount: 1,
      };

      mockUsersRepo.findAll.mockResolvedValue(users);
      mockCommissionsRepo.getStats.mockResolvedValue(commissionStats);

      const stats = await adminService.getDashboardStats();

      expect(stats).toEqual({
        users: {
          total: 2,
          artists: 1,
          requesters: 1,
          banned: 1,
        },
        commissions: {
          completed: 5,
          disputed: 1,
          totalVolume: 1000,
        },
      });
    });
  });

  describe('banUser', () => {
    it('should ban a user', async () => {
      const user = { id: 'user1', isBanned: false, ban: jest.fn() } as unknown as User;
      mockUsersRepo.findById.mockResolvedValue(user);

      await adminService.banUser('user1');

      expect(user.ban).toHaveBeenCalled();
      expect(mockUsersRepo.update).toHaveBeenCalledWith('user1', user);
    });
  });

  describe('resolveDispute', () => {
    it('should resolve dispute as refund (cancelled)', async () => {
      const commission = { 
        id: 'comm1', 
        status: CommissionStatus.DISPUTE, 
        resolveDispute: jest.fn() 
      } as unknown as Commission;

      mockCommissionsRepo.findById.mockResolvedValue(commission);

      await adminService.resolveDispute('comm1', 'refund');

      expect(commission.resolveDispute).toHaveBeenCalledWith('refund', undefined);
      expect(mockCommissionsRepo.update).toHaveBeenCalledWith('comm1', commission);
    });
  });
});
