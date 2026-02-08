// src/domain/entities/User.ts
export type UserRole = 'artist' | 'requester';

export interface UserPersistenceData {
  id: string;
  walletAddress: string;
  role?: UserRole;
  name?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateData {
  walletAddress: string;
  role: UserRole;
  name?: string;
  bio?: string;
  avatar?: string;
}

export class User {
  private constructor(
    private readonly _id: string,
    private _walletAddress: string,
    private _role: UserRole,
    private _name?: string,
    private _bio?: string,
    private _avatar?: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static create(data: UserCreateData): User {
    const id = crypto.randomUUID();
    const validatedWallet = User.validateWalletAddress(data.walletAddress);
    
    return new User(
      id,
      validatedWallet,
      data.role,
      data.name,
      data.bio,
      data.avatar
    );
  }

  static fromPersistence(data: UserPersistenceData): User {
    return new User(
      data.id,
      data.walletAddress,
      data.role as UserRole,
      data.name,
      data.bio,
      data.avatar,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateProfile(updates: {
    name?: string;
    bio?: string;
    avatar?: string;
    role?: UserRole;
  }): void {
    if (updates.name !== undefined) this._name = updates.name;
    if (updates.bio !== undefined) this._bio = updates.bio;
    if (updates.avatar !== undefined) this._avatar = updates.avatar;
    if (updates.role !== undefined) this._role = updates.role;
    this._updatedAt = new Date();
  }

  toPersistence(): UserPersistenceData {
    return {
      id: this._id,
      walletAddress: this._walletAddress,
      role: this._role,
      name: this._name,
      bio: this._bio,
      avatar: this._avatar,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  private static validateWalletAddress(address: string): string {
    if (!address || typeof address !== 'string') {
      throw new Error('Wallet address is required');
    }

    const trimmedAddress = address.trim();
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!ethAddressRegex.test(trimmedAddress)) {
      throw new Error('Invalid wallet address format');
    }

    return trimmedAddress.toLowerCase();
  }

  // Getters
  get id(): string { return this._id; }
  get walletAddress(): string { return this._walletAddress; }
  get role(): UserRole { return this._role; }
  get name(): string | undefined { return this._name; }
  get bio(): string | undefined { return this._bio; }
  get avatar(): string | undefined { return this._avatar; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
}
