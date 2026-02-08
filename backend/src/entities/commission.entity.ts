// src/entities/commission.entity.ts
import crypto from 'crypto';

export enum CommissionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface CommissionPersistenceData {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  providerId: string;
  status: CommissionStatus;
  price: number;
  deadline?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  ratingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Commission {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _description: string,
    private _requesterId: string,
    private _providerId: string,
    private _status: CommissionStatus,
    private _price: number,
    private _deadline?: Date,
    private _startedAt?: Date,
    private _completedAt?: Date,
    private _cancelledAt?: Date,
    private _ratingId?: string,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  static create(data: {
    title: string;
    description: string;
    requesterId: string;
    providerId: string;
    price: number;
    deadline?: Date;
  }): Commission {
    const id = crypto.randomUUID();
    
    Commission.validateTitle(data.title);
    Commission.validateDescription(data.description);
    Commission.validatePrice(data.price);

    return new Commission(
      id,
      data.title,
      data.description,
      data.requesterId,
      data.providerId,
      CommissionStatus.PENDING,
      data.price,
      data.deadline
    );
  }

  static fromPersistence(data: CommissionPersistenceData): Commission {
    return new Commission(
      data.id,
      data.title,
      data.description,
      data.requesterId,
      data.providerId,
      data.status,
      data.price,
      data.deadline,
      data.startedAt,
      data.completedAt,
      data.cancelledAt,
      data.ratingId,
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get requesterId(): string { return this._requesterId; }
  get providerId(): string { return this._providerId; }
  get status(): CommissionStatus { return this._status; }
  get price(): number { return this._price; }
  get deadline(): Date | undefined { return this._deadline ? new Date(this._deadline) : undefined; }
  get startedAt(): Date | undefined { return this._startedAt ? new Date(this._startedAt) : undefined; }
  get completedAt(): Date | undefined { return this._completedAt ? new Date(this._completedAt) : undefined; }
  get cancelledAt(): Date | undefined { return this._cancelledAt ? new Date(this._cancelledAt) : undefined; }
  get ratingId(): string | undefined { return this._ratingId; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

  // Business logic methods
  start(): void {
    if (this._status !== CommissionStatus.PENDING) {
      throw new Error('Commission can only be started from pending status');
    }
    this._status = CommissionStatus.IN_PROGRESS;
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  complete(ratingId: string): void {
    if (this._status !== CommissionStatus.IN_PROGRESS) {
      throw new Error('Commission can only be completed when in progress');
    }
    this._status = CommissionStatus.COMPLETED;
    this._completedAt = new Date();
    this._ratingId = ratingId;
    this._updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === CommissionStatus.COMPLETED || this._status === CommissionStatus.CANCELLED) {
      throw new Error('Commission cannot be cancelled in current status');
    }
    this._status = CommissionStatus.CANCELLED;
    this._cancelledAt = new Date();
    this._updatedAt = new Date();
  }

  updateDetails(update: {
    title?: string;
    description?: string;
    price?: number;
    deadline?: Date;
  }): void {
    let hasChanges = false;

    if (update.title && update.title !== this._title) {
      Commission.validateTitle(update.title);
      this._title = update.title;
      hasChanges = true;
    }

    if (update.description && update.description !== this._description) {
      Commission.validateDescription(update.description);
      this._description = update.description;
      hasChanges = true;
    }

    if (update.price && update.price !== this._price) {
      Commission.validatePrice(update.price);
      this._price = update.price;
      hasChanges = true;
    }

    if (update.deadline && update.deadline !== this._deadline) {
      this._deadline = update.deadline;
      hasChanges = true;
    }

    if (hasChanges) {
      this._updatedAt = new Date();
    }
  }

  // Validation methods
  private static validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }
    if (title.length > 200) {
      throw new Error('Title is too long (max 200 characters)');
    }
  }

  private static validateDescription(description: string): void {
    if (!description || description.trim().length === 0) {
      throw new Error('Description is required');
    }
    if (description.length > 5000) {
      throw new Error('Description is too long (max 5000 characters)');
    }
  }

  private static validatePrice(price: number): void {
    if (price <= 0) {
      throw new Error('Price must be greater than 0');
    }
    if (price > 1000000) {
      throw new Error('Price is too high');
    }
  }

  toPersistence(): CommissionPersistenceData {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      requesterId: this._requesterId,
      providerId: this._providerId,
      status: this._status,
      price: this._price,
      deadline: this._deadline,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      cancelledAt: this._cancelledAt,
      ratingId: this._ratingId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toResponse() {
    return {
      id: this._id,
      title: this._title,
      description: this._description,
      requesterId: this._requesterId,
      providerId: this._providerId,
      status: this._status,
      price: this._price,
      deadline: this._deadline,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      cancelledAt: this._cancelledAt,
      ratingId: this._ratingId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
