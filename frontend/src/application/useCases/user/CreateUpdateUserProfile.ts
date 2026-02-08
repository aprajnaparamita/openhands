// src/application/useCases/user/CreateOrUpdateUserProfile.ts
import { User, UserCreateData } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class CreateOrUpdateUserProfile {
  constructor(private userRepository: UserRepository) {}

  async execute(data: UserCreateData): Promise<User> {
    let user = await this.userRepository.findByWalletAddress(data.walletAddress);

    if (!user) {
      user = User.create(data);
    } else {
      user.updateProfile({
        name: data.name,
        bio: data.bio,
        avatar: data.avatar,
        role: data.role
      });
    }

    return this.userRepository.save(user);
  }
}
