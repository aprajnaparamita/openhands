import bcrypt from 'bcryptjs';
const { hash, compare } = bcrypt;
import crypto from 'crypto';

export interface UserPersistenceData {
  id: string;
  email?: string;
  password?: string;
  walletAddress?: string;
  role?: string;
  name?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreateData {
  email?: string;
  password?: string;
  walletAddress?: string;
  role?: string;
  name?: string;
  bio?: string;
}

export class User {
  private constructor(
    private readonly _id: string,
    private _email: string | undefined,
    private _password: string | undefined,
    private _walletAddress: string | undefined,
    private _role: string | undefined,
    private _name: string | undefined,
    private _bio: string | undefined,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  static async create(data: UserCreateData): Promise<User> {
    const id = User.generateId();
    let validatedEmail: string | undefined;
    let hashedPassword: string | undefined;

    if (data.email) {
      validatedEmail = User.validateEmail(data.email);
    }
    if (data.password) {
      hashedPassword = await User.hashPassword(data.password);
    }

    return new User(
      id, 
      validatedEmail, 
      hashedPassword, 
      data.walletAddress,
      data.role,
      data.name,
      data.bio
    );
  }

  static fromPersistence(data: UserPersistenceData): User {
    return new User(
      data.id,
      data.email,
      data.password,
      data.walletAddress,
      data.role,
      data.name,
      data.bio,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  toPersistence(): UserPersistenceData {
    return {
      id: this._id,
      email: this._email,
      password: this._password,
      walletAddress: this._walletAddress,
      role: this._role,
      name: this._name,
      bio: this._bio,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toResponse() {
    return {
      id: this._id,
      email: this._email,
      walletAddress: this._walletAddress,
      role: this._role,
      name: this._name,
      bio: this._bio,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  // Business Logic - Change Email
  async changeEmail(newEmail: string): Promise<void> {
    const validatedEmail = User.validateEmail(newEmail);
    this._email = validatedEmail;
    this._updatedAt = new Date();
  }

  // Business Logic - Change Password
  async changePassword(newPassword: string): Promise<void> {
    User.validatePassword(newPassword);
    const hashedPassword = await User.hashPassword(newPassword);
    this._password = hashedPassword;
    this._updatedAt = new Date();
  }

  // Verify Password
  async verifyPassword(inputPassword: string): Promise<boolean> {
    if (!this._password) return false;
    return compare(inputPassword, this._password);
  }

  // Domain Rule - Validate Email
  private static validateEmail(email: string): string {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) {
      throw new Error('Email cannot be empty');
    }

    if (trimmedEmail.length > 254) {
      throw new Error('Email is too long (max 254 characters)');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    return trimmedEmail.toLowerCase();
  }

  // Domain Rule - Validate Password
  private static validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password is too long (max 128 characters)');
    }

    // Must contain at least one number and one letter
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);

    if (!hasNumber || !hasLetter) {
      throw new Error('Password must contain at least one letter and one number');
    }
  }

  // Hash Password
  private static async hashPassword(password: string): Promise<string> {
    User.validatePassword(password);
    return hash(password, 12); // Use 12 rounds for enhanced security
  }

  // Generate ID
  private static generateId(): string {
    return crypto.randomUUID();
  }

  // Getters - Immutable from outside
  get id(): string {
    return this._id;
  }
  get email(): string | undefined {
    return this._email;
  }
  get password(): string | undefined {
    return this._password;
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
    email?: string; 
    password?: string;
    role?: string; 
    name?: string; 
    bio?: string; 
    walletAddress?: string;
  }): Promise<void> {
    let hasChanges = false;

    if (data.email && data.email !== this._email) {
      await this.changeEmail(data.email);
      hasChanges = true;
    }

    if (data.password) {
      await this.changePassword(data.password);
      hasChanges = true;
    }

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

    if (hasChanges) {
      this._updatedAt = new Date();
    }
  }

  // Equality Comparison
  equals(other: User): boolean {
    return this._id === other._id;
  }
}
