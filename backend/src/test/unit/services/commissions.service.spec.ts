import 'reflect-metadata';
import { CommissionsService } from '../../../services/commissions.service';
import { Commission, CommissionStatus } from '../../../entities/commission.entity';
import { ICommissionsRepository } from '../../../repositories/mongoose/commissions.repository';
import { UsersRepository } from '../../../repositories/users.repository';
import { ChatService } from '../../../services/chat.service';
import { HttpException } from '../../../exceptions/httpException';

describe('CommissionsService', () => {
  let commissionsService: CommissionsService;
  let mockCommissionsRepository: jest.Mocked<ICommissionsRepository>;
  let mockUsersRepository: jest.Mocked<UsersRepository>;
  let mockChatService: jest.Mocked<ChatService>;

  beforeEach(() => {
    mockCommissionsRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      findByProviderId: jest.fn(),
      findByRequesterId: jest.fn(),
      findByUserId: jest.fn(),
      findAllByUserId: jest.fn(),
      findAvailable: jest.fn(),
      findDisputed: jest.fn(),
      getStats: jest.fn(),
    } as any;

    mockUsersRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockChatService = {
      grantToken: jest.fn(),
    } as any;

    commissionsService = new CommissionsService(
      mockCommissionsRepository,
      mockUsersRepository,
      mockChatService
    );
  });

  describe('createCommission', () => {
    it('should create a new commission', async () => {
      const commissionData = {
        title: 'Test Commission',
        description: 'Test Description',
        requesterId: 'requester1',
        price: 100,
      };

      const createdCommission = Commission.create(commissionData);
      mockCommissionsRepository.save.mockResolvedValue(createdCommission);

      const result = await commissionsService.createCommission(commissionData);

      expect(mockCommissionsRepository.save).toHaveBeenCalled();
      expect(result.title).toBe(commissionData.title);
      expect(result.status).toBe(CommissionStatus.CREATED);
    });
  });

  describe('fundCommission', () => {
    it('should throw 404 if commission not found', async () => {
      mockCommissionsRepository.findById.mockResolvedValue(undefined);

      await expect(commissionsService.fundCommission('id', 'user')).rejects.toThrow(HttpException);
    });

    it('should throw 403 if user is not requester', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'Test',
        description: 'Desc',
        requesterId: 'requester1',
        status: CommissionStatus.CREATED,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);

      await expect(commissionsService.fundCommission('id', 'otherUser')).rejects.toThrow(HttpException);
    });

    it('should fund commission', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'Test',
        description: 'Desc',
        requesterId: 'requester1',
        status: CommissionStatus.CREATED,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);
      mockCommissionsRepository.update.mockResolvedValue(commission);

      const result = await commissionsService.fundCommission('id', 'requester1');

      expect(result.status).toBe(CommissionStatus.FUNDED);
      expect(mockCommissionsRepository.update).toHaveBeenCalled();
    });
  });

  describe('acceptCommission', () => {
    it('should prevent new provider with active project from accepting another', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'New Project',
        description: 'Desc',
        requesterId: 'requester1',
        status: CommissionStatus.FUNDED,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);

      // Provider has 0 completed projects
      // And 1 active project
      const activeProject = Commission.fromPersistence({
        id: 'active',
        title: 'Active Project',
        description: 'Desc',
        requesterId: 'requester2',
        status: CommissionStatus.IN_PROGRESS,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      mockCommissionsRepository.findByProviderId.mockResolvedValue([activeProject]);

      await expect(commissionsService.acceptCommission('id', 'provider1')).rejects.toThrow(HttpException);
    });

    it('should allow new provider with no active projects', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'New Project',
        description: 'Desc',
        requesterId: 'requester1',
        status: CommissionStatus.FUNDED,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);
      mockCommissionsRepository.update.mockResolvedValue(commission);

      // Provider has 0 projects
      mockCommissionsRepository.findByProviderId.mockResolvedValue([]);

      const result = await commissionsService.acceptCommission('id', 'provider1');

      expect(result.status).toBe(CommissionStatus.ACCEPTED);
      expect(result.providerId).toBe('provider1');
    });
  });
});
