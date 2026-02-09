import { injectable, inject } from 'tsyringe';
import { HttpException } from '../exceptions/httpException.js';
import { Rating } from '../entities/rating.entity.js';
import { CommissionStatus } from '../entities/commission.entity.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { MongooseCommissionsRepository } from '../repositories/mongoose/commissions.repository.js';
import { MongooseRatingsRepository, IRatingsRepository } from '../repositories/mongoose/ratings.repository.js';
import crypto from 'crypto';

@injectable()
export class RatingService {
  constructor(
    @inject(MongooseRatingsRepository) private ratingsRepository: IRatingsRepository,
    @inject(MongooseCommissionsRepository) private commissionsRepository: MongooseCommissionsRepository,
    @inject(UsersRepository) private usersRepository: UsersRepository
  ) {}

  async createRating(data: {
    commissionId: string;
    raterId: string;
    score: number;
    review?: string;
  }): Promise<Rating> {
    // Verify commission exists and is completed
    const commission = await this.commissionsRepository.findById(data.commissionId);
    if (!commission) {
      throw new HttpException(404, 'Commission not found');
    }

    if (commission.status !== CommissionStatus.COMPLETED) {
      throw new HttpException(400, 'Commission must be completed to rate');
    }

    if (commission.clientId !== data.raterId && commission.workerId !== data.raterId) {
      throw new HttpException(403, 'You are not a participant of this commission');
    }

    // Determine who is being rated
    const ratedUserId = commission.clientId === data.raterId ? commission.workerId : commission.clientId;
    if (!ratedUserId) {
       throw new HttpException(400, 'No user to rate');
    }

    // Check if rating already exists
    const existingRating = await this.ratingsRepository.findByCommissionId(data.commissionId);
    // TODO: Handle existing rating check if needed

    const rating = Rating.create({
      commissionId: data.commissionId,
      raterId: data.raterId,
      ratedUserId: ratedUserId,
      score: data.score,
      review: data.review
    });

    return this.ratingsRepository.save(rating);
  }

  async getUserRatings(userId: string): Promise<Rating[]> {
    return this.ratingsRepository.findByRatedUserId(userId);
  }
}
