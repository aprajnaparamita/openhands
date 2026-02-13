import { injectable, inject } from 'tsyringe';
import { Commission, CommissionStatus } from '../entities/commission.entity.js';
import { ICommissionsRepository } from '../repositories/mongoose/commissions.repository.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { HttpException } from '../exceptions/httpException.js';
import { ChatService } from './chat.service.js';

@injectable()
export class CommissionsService {
  constructor(
    @inject('CommissionsRepository') private commissionsRepository: ICommissionsRepository,
    @inject(UsersRepository) private usersRepository: UsersRepository,
    private chatService: ChatService
  ) {}

  async createCommission(data: {
    title: string;
    description: string;
    requesterId: string;
    providerId?: string;
    price: number;
    deadline?: Date;
    referenceImages?: string[];
  }): Promise<Commission> {
    const commission = Commission.create(data);
    return this.commissionsRepository.save(commission);
  }

  async fundCommission(commissionId: string, requesterId: string, txSignature?: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');
    
    if (commission.requesterId !== requesterId) {
      throw new HttpException(403, 'Only the requester can fund this commission');
    }

    commission.fund(txSignature);
    return this.commissionsRepository.update(commissionId, commission) as Promise<Commission>;
  }

  async acceptCommission(commissionId: string, providerId: string, txSignature?: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');

    // Eligibility Check: New providers (less than 3 completed) max 1 active project
    const providerCommissions = await this.commissionsRepository.findByProviderId(providerId);
    
    const completedCommissions = providerCommissions.filter(c => c.status === CommissionStatus.COMPLETED);
    const reviewCount = completedCommissions.length; // Simplified: Assuming completed = reviewed. Better to count actual ratings if possible, but COMPLETED implies review in this flow.
    
    const isNewProvider = reviewCount < 3; 
    
    // Active commissions for new provider includes anything not finalized
    const activeCommissions = providerCommissions.filter(c => 
      c.status === CommissionStatus.ACCEPTED || 
      c.status === CommissionStatus.IN_PROGRESS ||
      c.status === CommissionStatus.DELIVERED ||
      c.status === CommissionStatus.REVIEWED
    );
    
    if (isNewProvider && activeCommissions.length >= 1) {
       throw new HttpException(400, 'New providers (< 3 completed projects) can only have 1 active project. Please complete pending work first.');
    }

    commission.accept(providerId, txSignature);
    return this.commissionsRepository.update(commissionId, commission) as Promise<Commission>;
  }

  async reviewCommission(commissionId: string, userId: string, rating: { score: number; review: string }, txSignature?: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');

    if (commission.requesterId !== userId) {
      throw new HttpException(403, 'Only the requester can review the work');
    }

    commission.review(rating, txSignature);
    await this.commissionsRepository.update(commissionId, commission);

    if (commission.providerId) {
      await this.updateProviderStats(commission.providerId);
    }

    return commission;
  }

  async getChatToken(commissionId: string, userId: string): Promise<string> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');

    if (commission.requesterId !== userId && commission.providerId !== userId) {
      throw new HttpException(403, 'Not authorized to access this chat');
    }

    return this.chatService.grantToken(userId, commissionId);
  }

  async deliverWork(commissionId: string, providerId: string, artworkUrl: string, hash: string, txSignature?: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');

    if (commission.providerId !== providerId) {
      throw new HttpException(403, 'Only the provider can deliver work');
    }

    // Need to ensure it's in progress
    if (commission.status === CommissionStatus.ACCEPTED) {
        commission.startWork(); // Transition to In Progress implicitly if needed, or explicitly.
    }

    commission.deliverWork(artworkUrl, hash, txSignature);
    return this.commissionsRepository.update(commissionId, commission) as Promise<Commission>;
  }

  async completeCommission(commissionId: string, userId: string, txSignature?: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');

    // "Both parties must submit reviews" -> This logic might be complex. 
    // For now, let's assume one party triggers completion after reviews.
    // Or maybe "complete" is the final step after funds release.
    
    commission.complete(txSignature);
    await this.commissionsRepository.update(commissionId, commission);

    if (commission.providerId) {
      await this.updateProviderStats(commission.providerId);
    }
    
    return commission;
  }

  async cancelCommission(commissionId: string, userId: string, txSignature?: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) throw new HttpException(404, 'Commission not found');

    if (commission.requesterId !== userId && commission.providerId !== userId) {
        throw new HttpException(403, 'Not authorized to cancel this commission');
    }

    commission.cancel(txSignature);
    await this.commissionsRepository.update(commissionId, commission);

    if (commission.providerId) {
        await this.updateProviderStats(commission.providerId);
    }

    return commission;
  }

  async findById(id: string): Promise<Commission> {
    const commission = await this.commissionsRepository.findById(id);
    if (!commission) throw new HttpException(404, 'Commission not found');
    return commission;
  }

  async getUserCommissions(userId: string): Promise<Commission[]> {
    return this.commissionsRepository.findAllByUserId(userId);
  }
  
  async findUserCommissions(userId: string): Promise<Commission[]> {
    return this.commissionsRepository.findByUserId(userId);
  }

  async getAvailableCommissions(): Promise<Commission[]> {
    return this.commissionsRepository.findAvailable();
  }

  private async updateProviderStats(providerId: string): Promise<void> {
    const commissions = await this.commissionsRepository.findByProviderId(providerId);
    
    // 1. Calculate Ratings
    const ratedCommissions = commissions.filter(c => {
        const r = (c as any).ratingId || (c as any)._ratingId;
        return r && typeof r !== 'string' && typeof r.score === 'number';
    });
    
    const totalRatings = ratedCommissions.length;
    const averageRating = totalRatings > 0
      ? ratedCommissions.reduce((sum, c) => {
          const r = (c as any).ratingId || (c as any)._ratingId;
          return sum + r.score;
      }, 0) / totalRatings
      : 0;

    // 2. Calculate Completion Rate
    const completed = commissions.filter(c => c.status === CommissionStatus.COMPLETED).length;
    const cancelled = commissions.filter(c => c.status === CommissionStatus.CANCELLED).length;
    const totalFinished = completed + cancelled;
    
    const completionRate = totalFinished > 0 ? completed / totalFinished : 1.0;

    // 3. Update User
    const provider = await this.usersRepository.findById(providerId);
    if (provider) {
        provider.updateReputation(averageRating, totalRatings);
        provider.updateCompletionRate(completionRate);
        await this.usersRepository.update(provider.id, provider);
    }
  }
}
