import crypto from 'crypto';

export interface UserPersistenceData {
  id: string;
  walletAddress?: string;
  role?: string;
  name?: string;
  bio?: string;
  profileImage?: string;
  headerImage?: string;
  portfolio?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreateData {
  walletAddress?: string;
  role?: string;
  name?: string;
  bio?: string;
  profileImage?: string;
  headerImage?: string;
  portfolio?: string[];
}

export class User {
  private constructor(
    private readonly _id: string,
    private _walletAddress: string | undefined,
    private _role: string | undefined,
    private _name: string | undefined,
    private _bio: string | undefined,
    private _profileImage: string | undefined,
    private _headerImage: string | undefined,
    private _portfolio: string[] | undefined,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static async create(data: UserCreateData): Promise<User> {
    const id = User.generateId();

    return new User(
      id, 
      data.walletAddress,
      data.role,
      data.name,
      data.bio,
      data.profileImage,
      data.headerImage,
      data.portfolio
    );
  }

  static fromPersistence(data: UserPersistenceData): User {
    return new User(
      data.id,
      data.walletAddress,
      data.role,
      data.name,
      data.bio,
      data.profileImage,
      data.headerImage,
      data.portfolio,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  toPersistence(): UserPersistenceData {
    return {
      id: this._id,
      walletAddress: this._walletAddress,
      role: this._role,
      name: this._name,
      bio: this._bio,
      profileImage: this._profileImage,
      headerImage: this._headerImage,
      portfolio: this._portfolio,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toResponse() {
    return {
      id: this._id,
      walletAddress: this._walletAddress,
      role: this._role,
      name: this._name,
      bio: this._bio,
      profileImage: this._profileImage,
      headerImage: this._headerImage,
      portfolio: this._portfolio,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // Business Logic - Reset Profile (for testing)
  resetProfile(): void {
    this._name = undefined;
    this._bio = undefined;
    this._role = undefined;
    this._profileImage = undefined;
    this._headerImage = undefined;
    this._portfolio = undefined;
    this._updatedAt = new Date();
  }

  // Generate ID
  private static generateId(): string {
    return crypto.randomUUID();
  }

  // Getters - Immutable from outside
  get id(): string {
    return this._id;
  }
  get role(): string | undefined {
    return this._role;
  }
  get name(): string | undefined {
    return this._name;
  }
  get bio(): string | undefined {
    return this._bio;
  }
  get walletAddress(): string | undefined {
    return this._walletAddress;
  }
  get createdAt(): Date {
    return new Date(this._createdAt);
  } // Defensive copy
  get updatedAt(): Date {
    return new Date(this._updatedAt);
  } // Defensive copy

  // Domain Method - Update User Info
  async updateProfile(data: { 
    role?: string; 
    name?: string; 
    bio?: string; 
    walletAddress?: string;
    profileImage?: string;
    headerImage?: string;
    portfolio?: string[];
  }): Promise<void> {
    let hasChanges = false;


    if (data.role && data.role !== this._role) {
      this._role = data.role;
      hasChanges = true;
    }

    if (data.name && data.name !== this._name) {
      this._name = data.name;
      hasChanges = true;
    }

    if (data.bio && data.bio !== this._bio) {
      this._bio = data.bio;
      hasChanges = true;
    }

    if (data.walletAddress && data.walletAddress !== this._walletAddress) {
      this._walletAddress = data.walletAddress;
      hasChanges = true;
    }

    if (data.profileImage && data.profileImage !== this._profileImage) {
      this._profileImage = data.profileImage;
      hasChanges = true;
    }

    if (data.headerImage && data.headerImage !== this._headerImage) {
      this._headerImage = data.headerImage;
      hasChanges = true;
    }

    if (data.portfolio && JSON.stringify(data.portfolio) !== JSON.stringify(this._portfolio)) {
      this._portfolio = data.portfolio;
      hasChanges = true;
    }

    if (hasChanges) {
      this._updatedAt = new Date();
    }
  }

  // Equality Comparison
  equals(other: User): boolean {
    return this._id === other._id;
  }
}
