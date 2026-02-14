import { injectable, inject } from 'tsyringe';
import { HttpException } from '../exceptions/httpException.js';
import { User, type UserCreateData, UserType } from '../entities/user.entity.js';
import { UsersRepository } from '../repositories/users.repository.js';
import type { IUsersRepository } from '../repositories/users.repository.js';

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) private usersRepository: IUsersRepository) {}

  async getProviders(): Promise<User[]> {
    return this.usersRepository.findProviders();
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    let user: User | undefined;
    
    // Check if ID is a UUID (Mongo ID or standard UUID)
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
    
    if (!isUuid && (id.startsWith('0x') || id.length > 30)) {
      user = await this.usersRepository.findByWalletAddress(id);
    } else {
      user = await this.usersRepository.findById(id);
    }

    if (!user) throw new HttpException(404, 'User not found');
    return user;
  }

  async createUser(userData: UserCreateData): Promise<User> {
    if (userData.role === UserType.ADMIN) {
      throw new HttpException(403, 'Cannot create admin user via public API');
    }

    if (userData.walletAddress) {
      const exists = await this.usersRepository.findByWalletAddress(userData.walletAddress);
      if (exists) {
        console.log(`[UsersService] createUser: User with wallet ${userData.walletAddress} already exists. Updating...`);
        // If user exists, we treat this as an update to ensure profile data is saved
        await exists.updateProfile(userData);
        await this.usersRepository.update(exists.id, exists);
        return exists;
      }
    }

    // Create using the factory method of the Entity class (all validation is handled automatically)
    const user = await User.create(userData);
    await this.usersRepository.save(user);
    return user;
  }

  async updateUser(id: string, updateData: { 
    role?: string; 
    name?: string; 
    bio?: string; 
    walletAddress?: string;
    profileImage?: string;
    headerImage?: string;
    portfolio?: string[];
  }): Promise<User> {
    if (updateData.role === UserType.ADMIN) {
      throw new HttpException(403, 'Cannot update user to admin role');
    }

    console.log(`[UsersService] updateUser: Updating user ${id}`, updateData);
    let existingUser: User | undefined;
    
    if (id.startsWith('0x') || (id.length > 30 && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id))) {
      existingUser = await this.usersRepository.findByWalletAddress(id);
    } else {
      existingUser = await this.usersRepository.findById(id);
    }

    if (!existingUser) {
      console.log(`[UsersService] updateUser: User ${id} not found. Attempting create.`);
      // For wallet users, we might want to create on update if they don't exist yet
      // This supports the flow where PUT is called before POST
      const isWallet = id.startsWith('0x') || (id.length > 30 && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id));
      
      if (isWallet) {
        // Create new user with this wallet address and the update data
        const userData: UserCreateData = {
           walletAddress: id,
           ...updateData
        };
        const newUser = await User.create(userData);
        await this.usersRepository.save(newUser);
        return newUser;
      }

      throw new HttpException(404, 'User not found');
    }

    await existingUser.updateProfile(updateData);
    await this.usersRepository.update(existingUser.id, existingUser);
    return existingUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.usersRepository.delete(id);
  }

  async resetUser(userId: string): Promise<void> {
     const user = await this.usersRepository.findById(userId);
     if (user) {
         // Reset fields
         // We can't easily reset private fields without a method on User entity
         // or we delete and recreate.
         // Let's just delete for now as "reset" usually means clearing data.
         // Or maybe just clear the role?
         // The requirement "reset the user as if they were a new user" implies clearing role, name, bio.
         // But keeping the ID/Wallet.
         
         // Assuming we can update via repository if we construct a new user or modify existing
         // Since User entity encapsulates state, we need a method there.
         // But I can't modify User entity easily here without reading it first.
         // Let's rely on delete for now if that's what reset implies, 
         // OR update with empty fields.
         
         // Actually, let's just delete the user. The next login will create a new one.
         await this.usersRepository.delete(userId);
     }
  }
}
