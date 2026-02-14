import 'reflect-metadata';
import { RatingService } from '../../../services/rating.service';
import { Rating } from '../../../entities/rating.entity';
import { Commission, CommissionStatus } from '../../../entities/commission.entity';
import { MongooseCommissionsRepository } from '../../../repositories/mongoose/commissions.repository';
import { MongooseRatingsRepository } from '../../../repositories/mongoose/ratings.repository';
import { UsersRepository } from '../../../repositories/users.repository';
import { HttpException } from '../../../exceptions/httpException';

describe('RatingService', () => {
  let ratingService: RatingService;
  let mockRatingsRepository: jest.Mocked<MongooseRatingsRepository>;
  let mockCommissionsRepository: jest.Mocked<MongooseCommissionsRepository>;
  let mockUsersRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockRatingsRepository = {
      save: jest.fn(),
      findByCommissionId: jest.fn(),
      findByRatedUserId: jest.fn(),
    } as any;

    mockCommissionsRepository = {
      findById: jest.fn(),
    } as any;

    mockUsersRepository = {} as any;

    ratingService = new RatingService(
      mockRatingsRepository,
      mockCommissionsRepository,
      mockUsersRepository
    );
  });

  describe('createRating', () => {
    it('should throw 404 if commission not found', async () => {
      mockCommissionsRepository.findById.mockResolvedValue(undefined);

      await expect(ratingService.createRating({
        commissionId: 'id',
        raterId: 'rater',
        score: 5
      })).rejects.toThrow(HttpException);
    });

    it('should throw 400 if commission is not completed', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'Test',
        description: 'Desc',
        requesterId: 'requester1',
        status: CommissionStatus.IN_PROGRESS,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);

      await expect(ratingService.createRating({
        commissionId: 'id',
        raterId: 'requester1',
        score: 5
      })).rejects.toThrow(HttpException);
    });

    it('should throw 403 if rater is not a participant', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'Test',
        description: 'Desc',
        requesterId: 'requester1',
        providerId: 'provider1',
        status: CommissionStatus.COMPLETED,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);

      await expect(ratingService.createRating({
        commissionId: 'id',
        raterId: 'outsider',
        score: 5
      })).rejects.toThrow(HttpException);
    });

    it('should create rating if valid', async () => {
      const commission = Commission.fromPersistence({
        id: 'id',
        title: 'Test',
        description: 'Desc',
        requesterId: 'requester1',
        providerId: 'provider1',
        status: CommissionStatus.COMPLETED,
        price: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      mockCommissionsRepository.findById.mockResolvedValue(commission);
      mockRatingsRepository.findByCommissionId.mockResolvedValue(undefined);
      mockRatingsRepository.save.mockImplementation(async (r) => r);

      const result = await ratingService.createRating({
        commissionId: 'id',
        raterId: 'requester1',
        score: 5,
        review: 'Great job!'
      });

      expect(result.score).toBe(5);
      expect(result.review).toBe('Great job!');
      expect(mockRatingsRepository.save).toHaveBeenCalled();
    });
  });
});
