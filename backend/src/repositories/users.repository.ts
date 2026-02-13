import { singleton } from 'tsyringe';
import { User, type UserPersistenceData } from '../entities/user.entity.js';

export interface IUsersRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | undefined>;
  findByWalletAddress(walletAddress: string): Promise<User | undefined>;
  findByIdWithToken(id: string): Promise<User | undefined>;
  save(user: User): Promise<User>;
  update(id: string, user: User): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
  findProviders(limit?: number, offset?: number): Promise<User[]>;
  findAvailableProviders(limit?: number, offset?: number): Promise<User[]>;
}

@singleton()
export class UsersRepository implements IUsersRepository {
  private users: UserPersistenceData[] = [];

  async findAll(): Promise<User[]> {
    return this.users.map((userData) => User.fromPersistence(userData));
  }

  async findById(id: string): Promise<User | undefined> {
    const userData = this.users.find((u) => u.id === id);
    return userData ? User.fromPersistence(userData) : undefined;
  }

  async findByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const userData = this.users.find((u) => u.walletAddress === walletAddress);
    return userData ? User.fromPersistence(userData) : undefined;
  }

  async findByIdWithToken(id: string): Promise<User | undefined> {
    const userData = this.users.find((u) => u.id === id);
    return userData ? User.fromPersistence(userData) : undefined;
  }

  async save(user: User): Promise<User> {
    const persistenceData = user.toPersistence();
    this.users.push(persistenceData);
    return user;
  }

  async update(id: string, user: User): Promise<User | undefined> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;

    this.users[idx] = user.toPersistence();
    return user;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    return true;
  }

  async findProviders(limit: number = 20, offset: number = 0): Promise<User[]> {
    return this.users
      .filter(u => u.role === 'artist')
      .slice(offset, offset + limit)
      .map(u => User.fromPersistence(u));
  }

  async findAvailableProviders(limit: number = 20, offset: number = 0): Promise<User[]> {
    return this.users
      .filter(u => u.role === 'artist' && u.isAvailable)
      .slice(offset, offset + limit)
      .map(u => User.fromPersistence(u));
  }

  reset() {
    this.users = [];
  }
}
