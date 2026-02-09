import { injectable, inject } from 'tsyringe';
import { HttpException } from '../exceptions/httpException.js';
import { User, type UserCreateData } from '../entities/user.entity.js';
import { UsersRepository } from '../repositories/users.repository.js';
import type { IUsersRepository } from '../repositories/users.repository.js';

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) private usersRepository: IUsersRepository) {}

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new HttpException(404, 'User not found');
    return user;
  }

  async createUser(userData: UserCreateData): Promise<User> {
    // Check email existence only if email is provided
    if (userData.email) {
      const exists = await this.usersRepository.findByEmail(userData.email);
      if (exists) throw new HttpException(409, 'Email already exists');
    }
    
    if (userData.walletAddress) {
      const exists = await this.usersRepository.findByWalletAddress(userData.walletAddress);
      if (exists) return exists; // Idempotency for wallet login
    }

    // Create using the factory method of the Entity class (all validation is handled automatically)
    const user = await User.create(userData);
    await this.usersRepository.save(user);
    return user;
  }

  async updateUser(id: string, updateData: { email?: string; password?: string; role?: string; name?: string; bio?: string; walletAddress?: string }): Promise<User> {
    let existingUser: User | undefined;
    
    if (id.startsWith('0x') || id.length > 30) {
      existingUser = await this.usersRepository.findByWalletAddress(id);
    }
    
    if (!existingUser) {
      existingUser = await this.usersRepository.findById(id);
    }

    if (!existingUser) {
      // For wallet users, we might want to create on update if they don't exist yet
      // But usually create should happen first. 
      // However, the frontend flow tries to PUT to /users/:address for profile setup.
      // If user doesn't exist, we should create them.
      // If the ID looks like a wallet address, we can use it as the walletAddress for creation
      const isWallet = id.startsWith('0x') || id.length > 30;
      
      if (isWallet || updateData.walletAddress) {
        // Ensure walletAddress is set in the creation data
        const createData = {
          ...updateData,
          walletAddress: updateData.walletAddress || (isWallet ? id : undefined)
        };
        return this.createUser(createData as UserCreateData);
      }
      throw new HttpException(404, 'User not found');
    }

    // Update using the domain method of the Entity
    // Handle specific updates
    if (updateData.email) await existingUser.changeEmail(updateData.email);
    if (updateData.password) await existingUser.changePassword(updateData.password);

    existingUser.updateProfile(updateData.name, updateData.bio, updateData.role);

    const updated = await this.usersRepository.update(existingUser.id, existingUser);
    if (!updated) throw new HttpException(404, 'User not found');
    return updated;
  }

  async resetUser(id: string): Promise<void> {
    let user: User | undefined;
    
    if (id.startsWith('0x') || id.length > 30) {
      user = await this.usersRepository.findByWalletAddress(id);
    }
    
    if (!user) {
      user = await this.usersRepository.findById(id);
    }

    if (!user) throw new HttpException(404, 'User not found');

    const deleted = await this.usersRepository.delete(user.id);
    if (!deleted) throw new HttpException(500, 'Failed to reset user');
  }

  async deleteUser(id: string): Promise<void> {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted) throw new HttpException(404, 'User not found');
  }
}
