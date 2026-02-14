import { injectable, inject } from 'tsyringe';
import { MongooseUsersRepository } from '../repositories/mongoose/users.repository';
import { MongooseCommissionsRepository } from '../repositories/mongoose/commissions.repository';
import { UserType } from '../entities/user.entity';
import { CommissionStatus } from '../entities/commission.entity';

@injectable()
export class AdminService {
  constructor(
    @inject(MongooseUsersRepository) private usersRepository: MongooseUsersRepository,
    @inject(MongooseCommissionsRepository) private commissionsRepository: MongooseCommissionsRepository
  ) {}

  async getDashboardStats() {
    const users = await this.usersRepository.findAll();
    const commissionStats = await this.commissionsRepository.getStats();

    const artists = users.filter(u => u.role === UserType.ARTIST);
    const requesters = users.filter(u => u.role === UserType.REQUESTER);

    return {
      users: {
        total: users.length,
        artists: artists.length,
        requesters: requesters.length,
        banned: users.filter(u => u.isBanned).length
      },
      commissions: {
        completed: commissionStats.completedCount,
        disputed: commissionStats.disputeCount,
        totalVolume: commissionStats.totalVolume
      }
    };
  }

  async getDisputes() {
    return this.commissionsRepository.findDisputed();
  }

  async resolveDispute(commissionId: string, resolution: 'refund' | 'pay_provider', txSignature?: string) {
    const commission = await this.commissionsRepository.findById(commissionId);
    if (!commission) {
      throw new Error('Commission not found');
    }

    commission.resolveDispute(resolution, txSignature);
    await this.commissionsRepository.update(commission.id, commission);
    return commission;
  }

  async banUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.ban();
    await this.usersRepository.update(user.id, user);
    return user;
  }

  async unbanUser(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.unban();
    await this.usersRepository.update(user.id, user);
    return user;
  }

  async getUsers() {
    return this.usersRepository.findAll();
  }
}
