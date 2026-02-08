import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from '@services/rating.service';
import { IRatingsRepository } from '@repositories/ratings.repository';
import { ICommissionsRepository } from '@repositories/mongoose/commissions.repository';
import { IUsersRepository } from '@repositories/users.repository';
import { Rating } from '@entities/rating.entity';
import { Commission, CommissionStatus } from '@entities/commission.entity';
import { User, UserRole } from '@entities/user.entity';
import { HttpException } from '@exceptions/httpException';

describe('RatingService', () => {
  let service: RatingService;
  let ratingsRepository: jest.Mocked<IRatingsRepository>;
  let commissionsRepository: jest.Mocked<ICommissionsRepository>;
  let usersRepository: jest.Mocked<IUsersRepository>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'hashedpassword',
    name: 'Test User',
    role: UserRole.ARTIST,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommission: Commission = {
    id: 'commission-123',
    title: 'Test Commission',
    description: 'Test Description',
    price: 100,
    status: CommissionStatus.COMPLETED,
    artistId: 'artist-123',
    clientId: 'client-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRating: Rating = {
    id: 'rating-123',
    commissionId: 'commission-123',
    raterId: 'client-123',
    ratedUserId: 'artist-123',
    score: 5,
    review: 'Great work!',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: 'IRatingsRepository',
          useValue: {
            save: jest.fn(),
            findByRatedUserId: jest.fn(),
            findByCommissionId: jest.fn(),
          },
        },
        {
          provide: 'ICommissionsRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: 'IUsersRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingsRepository = module.get('IRatingsRepository');
    commissionsRepository = module.get('ICommissionsRepository');
    usersRepository = module.get('IUsersRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createRating', () => {
    it('should create a rating successfully', async () => {
      // Mock repository responses
      commissionsRepository.findById.mockResolvedValue(mockCommission);
      usersRepository.findById.mockResolvedValue(mockUser);
      ratingsRepository.findByCommissionId.mockResolvedValue(undefined);
      ratingsRepository.save.mockResolvedValue(mockRating);

      const result = await service.createRating({
        commissionId: 'commission-123',
        raterId: 'client-123',
        score: 5,
        review: 'Great work!',
      });

      expect(result).toEqual(mockRating);
      expect(commissionsRepository.findById).toHaveBeenCalledWith('commission-123');
      expect(ratingsRepository.save).toHaveBeenCalled();
    });

    it('should throw an error if commission is not found', async () => {
      commissionsRepository.findById.mockResolvedValue(undefined);

      await expect(
        service.createRating({
          commissionId: 'non-existent-commission',
          raterId: 'client-123',
          score: 5,
        })
      ).rejects.toThrow(HttpException);
    });

    it('should throw an error if commission is not completed', async () => {
      const inProgressCommission = {
        ...mockCommission,
        status: CommissionStatus.IN_PROGRESS,
      };
      commissionsRepository.findById.mockResolvedValue(inProgressCommission);

      await expect(
        service.createRating({
          commissionId: 'commission-123',
          raterId: 'client-123',
          score: 5,
        })
      ).rejects.toThrow('Cannot rate an incomplete commission');
    });

    it('should throw an error if rater is not part of the commission', async () => {
      commissionsRepository.findById.mockResolvedValue(mockCommission);

      await expect(
        service.createRating({
          commissionId: 'commission-123',
          raterId: 'unauthorized-user',
          score: 5,
        })
      ).rejects.toThrow('You are not authorized to rate this commission');
    });

    it('should throw an error if rating already exists for this commission', async () => {
      commissionsRepository.findById.mockResolvedValue(mockCommission);
      ratingsRepository.findByCommissionId.mockResolvedValue(mockRating);

      await expect(
        service.createRating({
          commissionId: 'commission-123',
          raterId: 'client-123',
          score: 5,
        })
      ).rejects.toThrow('This commission has already been rated');
    });
  });

  describe('getUserRatings', () => {
    it('should return all ratings for a user', async () => {
      const mockRatings = [mockRating];
      ratingsRepository.findByRatedUserId.mockResolvedValue(mockRatings);

      const result = await service.getUserRatings('artist-123');
      
      expect(result).toEqual(mockRatings);
      expect(ratingsRepository.findByRatedUserId).toHaveBeenCalledWith('artist-123');
    });

    it('should return an empty array if no ratings exist', async () => {
      ratingsRepository.findByRatedUserId.mockResolvedValue([]);

      const result = await service.getUserRatings('artist-123');
      
      expect(result).toEqual([]);
      expect(ratingsRepository.findByRatedUserId).toHaveBeenCalledWith('artist-123');
    });
  });
});
