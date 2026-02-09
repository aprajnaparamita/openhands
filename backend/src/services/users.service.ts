import { injectable, inject } from 'tsyringe';
import jwt from 'jsonwebtoken';
const { sign } = jwt;
import { NODE_ENV, SECRET_KEY } from '../config/env.js';
import { HttpException } from '../exceptions/httpException.js';
import { User, type UserCreateData } from '../entities/user.entity.js';
import { UsersRepository } from '../repositories/users.repository.js';
import type { IUsersRepository } from '../repositories/users.repository.js';
import { DataStoredInToken, TokenData } from '../interfaces/auth.interface.js';

@injectable()
export class UsersService {
  constructor(@inject(UsersRepository) private usersRepository: IUsersRepository) {}

  public createToken(user: User): TokenData {
    if (!SECRET_KEY) throw new Error('SECRET_KEY is not defined');

    if (user.id === undefined) {
      throw new Error('User id is undefined');
    }

    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const expiresIn = 60 * 60 * 24 * 7; // 7 days
    const token = sign(dataStoredInToken, SECRET_KEY as string, { expiresIn });
    return { expiresIn, token };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${
      tokenData.expiresIn
    }; Path=/; SameSite=Lax;${NODE_ENV === 'production' ? ' Secure;' : ''}`;
  }

  async getAllUsers(): Promise<User[]> {
    return this.usersRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    let user: User | undefined;
    
    // Check if ID is a wallet address
    if (id.startsWith('0x') || id.length > 30) {
      user = await this.usersRepository.findByWalletAddress(id);
    }

    if (!user) {
      user = await this.usersRepository.findById(id);
    }

    if (!user) throw new HttpException(404, 'User not found');
    return user;
  }

  async createUser(userData: UserCreateData): Promise<User> {
    if (userData.walletAddress) {
      const exists = await this.usersRepository.findByWalletAddress(userData.walletAddress);
      if (exists) return exists; // Idempotency for wallet login
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
    await existingUser.updateProfile(updateData);

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
