import crypto from 'crypto';

export enum UserType {
  ARTIST = 'artist',
  REQUESTER = 'requester'
}

export interface UserPersistenceData {
  id: string;
  walletAddress?: string;
  role?: string;
  name?: string;
  bio?: string;
  profileImage?: string;
  headerImage?: string;
  portfolio?: string[];
  skills?: string[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
  workDescription?: string;
  isAvailable?: boolean;
  cachedAverageRating?: number;
  cachedTotalRatings?: number;
  cachedCompletionRate?: number;
  refreshToken?: string;
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
  skills?: string[];
  socialLinks?: {
    website?: string;
    twitter?: string;
    instagram?: string;
    github?: string;
  };
  workDescription?: string;
  isAvailable?: boolean;
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
    private _skills: string[] | undefined,
    private _socialLinks: { website?: string; twitter?: string; instagram?: string; github?: string } | undefined,
    private _workDescription: string | undefined,
    private _isAvailable: boolean | undefined,
    private _cachedAverageRating: number | undefined,
    private _cachedTotalRatings: number | undefined,
    private _cachedCompletionRate: number | undefined,
    private _refreshToken: string | undefined,
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
      data.portfolio,
      data.skills,
      data.socialLinks,
      data.workDescription,
      data.isAvailable ?? true,
      undefined, // cachedAverageRating
      undefined, // cachedTotalRatings
      undefined, // cachedCompletionRate
      undefined // No refresh token on creation
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
      data.skills,
      data.socialLinks,
      data.workDescription,
      data.isAvailable,
      data.cachedAverageRating,
      data.cachedTotalRatings,
      data.cachedCompletionRate,
      data.refreshToken,
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
      skills: this._skills,
      socialLinks: this._socialLinks,
      workDescription: this._workDescription,
      isAvailable: this._isAvailable,
      cachedAverageRating: this._cachedAverageRating,
      cachedTotalRatings: this._cachedTotalRatings,
      cachedCompletionRate: this._cachedCompletionRate,
      refreshToken: this._refreshToken,
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
      skills: this._skills,
      socialLinks: this._socialLinks,
      workDescription: this._workDescription,
      isAvailable: this._isAvailable,
      cachedAverageRating: this._cachedAverageRating,
      cachedTotalRatings: this._cachedTotalRatings,
      cachedCompletionRate: this._cachedCompletionRate,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // Business Logic - Auth
  setRefreshToken(token: string | undefined): void {
    this._refreshToken = token;
    this._updatedAt = new Date();
  }

  get refreshToken(): string | undefined {
    return this._refreshToken;
  }

  // Business Logic - Reset Profile (for testing)
  resetProfile(): void {
    this._name = undefined;
    this._bio = undefined;
    this._role = undefined;
    this._profileImage = undefined;
    this._headerImage = undefined;
    this._portfolio = undefined;
    this._skills = undefined;
    this._socialLinks = undefined;
    this._workDescription = undefined;
    this._isAvailable = undefined;
    this._cachedAverageRating = undefined;
    this._cachedTotalRatings = undefined;
    this._cachedCompletionRate = undefined;
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
  get workDescription(): string | undefined {
    return this._workDescription;
  }
  get isAvailable(): boolean | undefined {
    return this._isAvailable;
  }
  get cachedAverageRating(): number | undefined {
    return this._cachedAverageRating;
  }
  get cachedTotalRatings(): number | undefined {
    return this._cachedTotalRatings;
  }
  get cachedCompletionRate(): number | undefined {
    return this._cachedCompletionRate;
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
    skills?: string[];
    socialLinks?: { website?: string; twitter?: string; instagram?: string; github?: string };
    workDescription?: string;
    isAvailable?: boolean;
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

    if (data.skills && JSON.stringify(data.skills) !== JSON.stringify(this._skills)) {
      this._skills = data.skills;
      hasChanges = true;
    }

    if (data.socialLinks && JSON.stringify(data.socialLinks) !== JSON.stringify(this._socialLinks)) {
      this._socialLinks = data.socialLinks;
      hasChanges = true;
    }

    if (data.workDescription !== undefined && data.workDescription !== this._workDescription) {
      this._workDescription = data.workDescription;
      hasChanges = true;
    }

    if (data.isAvailable !== undefined && data.isAvailable !== this._isAvailable) {
      this._isAvailable = data.isAvailable;
      hasChanges = true;
    }

    if (hasChanges) {
      this._updatedAt = new Date();
    }
  }

  updateReputation(average: number, total: number): void {
    this._cachedAverageRating = average;
    this._cachedTotalRatings = total;
    this._updatedAt = new Date();
  }

  updateCompletionRate(rate: number): void {
    this._cachedCompletionRate = rate;
    this._updatedAt = new Date();
  }

  // Equality Comparison
  equals(other: User): boolean {
    return this._id === other._id;
  }
}
