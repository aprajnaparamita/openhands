// src/services/rating.service.ts
import { injectable, inject } from 'tsyringe';
import { HttpException } from '@exceptions/httpException';
import { Rating } from '@entities/rating.entity';
import { Commission, CommissionStatus } from '@entities/commission.entity';
import { User } from '@entities/user.entity';
import { IUsersRepository } from '@repositories/users.repository';
import { ICommissionsRepository } from '@repositories/mongoose/commissions.repository';

export interface IRatingsRepository {
  save(rating: Rating): Promise<Rating>;
  findByRatedUserId(userId: string): Promise<Rating[]>;
  findByCommissionId(commissionId: string): Promise<Rating | undefined>;
}

@injectable()
export class RatingService {
  constructor(
    @inject(IRatingsRepository) private ratingsRepository: IRatingsRepository,
    @inject(ICommissionsRepository) private commissionsRepository: ICommissionsRepository,
    @inject(IUsersRepository) private usersRepository: IUsersRepository
  ) {}

  async createRating(data: {
    commissionId: string;
    raterId: string;
    score: number;
    review?: string;
  }): Promise<Rating> {
    // Verify commission exists and is completed
    const commission = await this.commissionsRepository.findById(data.commissionId);
    if (!commission)
