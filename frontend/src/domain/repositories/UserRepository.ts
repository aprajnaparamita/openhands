// src/domain/repositories/UserRepository.ts
import { User, UserPersistenceData } from '../entities/User';

export interface UserRepository {
  findByWalletAddress(walletAddress: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
}
