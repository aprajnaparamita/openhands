// src/services/profile.service.ts
import { injectable, inject } from 'tsyringe';
import { HttpException } from '@exceptions/httpException';
import { User, UserType } from '@entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';
import { MongooseCommissionsRepository } from '@repositories/mongoose/commissions.repository';
import { StorageService } from './storage.service';

export interface UserProfileResponse {
  user: ReturnType<User['toResponse']>;
  commissions?: Array<{
    commission: any;
    rating?: any;
    review?: string;
  }>;
  stats?: {
    totalCommissions: number;
    completedCommissions: number;
    averageRating?: number;
  };
}

@injectable()
export class ProfileService {
  constructor(
    @inject(UsersRepository) private usersRepository: UsersRepository,
    @inject(MongooseCommissionsRepository) private commissionsRepository: MongooseCommissionsRepository,
    @inject(StorageService) private storageService: StorageService
  ) {}

  async updateProfile(
    userId: string,
    update: {
      bio?: string;
      workDescription?: string;
      isAvailable?: boolean;
      profileImage?: Buffer;
      headerImage?: Buffer;
    }
  ): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, 'User not found');
    }

    const updates: any = {
      bio: update.bio,
      workDescription: update.workDescription,
      isAvailable: update.isAvailable,
    };

    // Handle image uploads
    if (update.profileImage) {
      const uploadResult = await this.storageService.uploadImage(
        update.profileImage,
        userId,
        {
          folder: `profiles/${userId}`,
          transformation: {
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face',
          },
        }
      );
      updates.profileImage = uploadResult.url;
    }

    if (update.headerImage) {
      const uploadResult = await this.storageService.uploadImage(
        update.headerImage,
        userId,
        {
          folder: `headers/${userId}`,
          transformation: {
            width: 1200,
            height: 400,
            crop: 'fill',
          },
        }
      );
      updates.headerImage = uploadResult.url;
    }

    user.updateProfile(updates);
    const updatedUser = await this.usersRepository.update(userId, user);
    
    if (!updatedUser) {
      throw new HttpException(500, 'Failed to update profile');
    }

    return updatedUser;
  }

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new HttpException(404, 'User not found');
    }

    const response: UserProfileResponse = {
      user: user.toResponse(),
    };

    // Get commissions based on user type
    const commissions = await this.commissionsRepository.findByUserId(userId);
    
    if (commissions.length > 0) {
      response.commissions = commissions.map(commission => {
        const rating = typeof commission.ratingId === 'object' ? commission.ratingId : undefined;
        return {
          commission: commission.toResponse(),
          rating: rating ? {
            score: rating.score,
            review: rating.review,
          } : undefined,
        };
      });

      // Calculate stats
      const completedCommissions = commissions.filter(c => c.status === 'completed');
      response.stats = {
        totalCommissions: commissions.length,
        completedCommissions: completedCommissions.length,
        averageRating: user.cachedAverageRating,
      };
    }

    return response;
  }

  async searchProviders(query: {
    search?: string;
    minRating?: number;
    availableOnly?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    // This would use a more sophisticated search in production
    // For now, we'll implement basic filtering
    
    let providers;
    if (query.availableOnly) {
      providers = await this.usersRepository.findAvailableProviders(query.limit, query.offset);
    } else {
      providers = await this.usersRepository.findProviders(query.limit, query.offset);
    }

    // Apply additional filters
    if (query.minRating) {
      providers = providers.filter(p => 
        p.cachedAverageRating && p.cachedAverageRating >= query.minRating!
      );
    }

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      providers = providers.filter(p => 
        p.bio?.toLowerCase().includes(searchLower) ||
        p.workDescription?.toLowerCase().includes(searchLower)
      );
    }

    return providers;
  }
}
