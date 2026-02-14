// src/entities/commission.entity.ts
import crypto from 'crypto';

export enum CommissionStatus {
  CREATED = 'created',
  FUNDED = 'funded',
  ACCEPTED = 'accepted',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  REVIEWED = 'reviewed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTE = 'dispute',
}

export interface CommissionPersistenceData {
  id: string;
  title: string;
  description: string;
  requesterId: string;
  providerId?: string; // Optional initially if it's an open job, but user story says "Provider Acceptance", implies direct or open. 
                       // "Provider reviews project terms" -> maybe requester picks provider first? 
                       // "Create a new project" -> usually implies a job post or direct request. 
                       // Let's assume direct request for now or job post.
                       // Actually "Provider Acceptance" implies a specific provider.
  status: CommissionStatus;
  price: number;
  deadline?: Date;
  referenceImages?: string[];
  requirements?: string[];
  tags?: string[];
  finalArtwork?: string;
  finalArtworkHash?: string;
  escrowAddress?: string;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  disputeAt?: Date;
  ratingId?: string | { score: number; review: string };
  txSignatures?: {
    fund?: string;
    accept?: string;
    deliver?: string;
    review?: string;
    complete?: string;
    resolve?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class Commission {
  private constructor(
    private readonly _id: string,
    private _title: string,
    private _description: string,
    private _requesterId: string,
    private _providerId: string | undefined,
    private _status: CommissionStatus,
    private _price: number,
    private _deadline?: Date,
    private _referenceImages: string[] = [],
    private _requirements: string[] = [],
    private _tags: string[] = [],
    private _finalArtwork?: string,
    private _finalArtworkHash?: string,
    private _escrowAddress?: string,
    private _startedAt?: Date,
    private _completedAt?: Date,
    private _cancelledAt?: Date,
    private _disputeAt?: Date,
    private _ratingId?: string | { score: number; review: string },
    private _txSignatures: { fund?: string; accept?: string; deliver?: string; review?: string; complete?: string; resolve?: string } = {},
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date()
  ) {}

  static create(data: {
    title: string;
    description: string;
    requesterId: string;
    providerId?: string;
    price: number;
    deadline?: Date;
    referenceImages?: string[];
    requirements?: string[];
    tags?: string[];
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
      CommissionStatus.CREATED,
      data.price,
      data.deadline,
      data.referenceImages,
      data.requirements,
      data.tags
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
      data.referenceImages,
      data.requirements,
      data.tags,
      data.finalArtwork,
      data.finalArtworkHash,
      data.escrowAddress,
      data.startedAt,
      data.completedAt,
      data.cancelledAt,
      data.disputeAt,
      data.ratingId,
      data.txSignatures || {},
      data.createdAt,
      data.updatedAt
    );
  }

  // Getters
  get id(): string { return this._id; }
  get title(): string { return this._title; }
  get description(): string { return this._description; }
  get requesterId(): string { return this._requesterId; }
  get providerId(): string | undefined { return this._providerId; }
  get status(): CommissionStatus { return this._status; }
  get price(): number { return this._price; }
  get deadline(): Date | undefined { return this._deadline ? new Date(this._deadline) : undefined; }
  get referenceImages(): string[] { return [...this._referenceImages]; }
  get requirements(): string[] { return [...this._requirements]; }
  get tags(): string[] { return [...this._tags]; }
  get finalArtwork(): string | undefined { return this._finalArtwork; }
  get finalArtworkHash(): string | undefined { return this._finalArtworkHash; }
  get escrowAddress(): string | undefined { return this._escrowAddress; }
  get startedAt(): Date | undefined { return this._startedAt ? new Date(this._startedAt) : undefined; }
  get completedAt(): Date | undefined { return this._completedAt ? new Date(this._completedAt) : undefined; }
  get txSignatures(): { fund?: string; accept?: string; deliver?: string; review?: string; complete?: string; resolve?: string } { return { ...this._txSignatures }; }
  
  // Domain Methods
  fund(txSignature?: string): void {
    if (this._status !== CommissionStatus.CREATED) {
      throw new Error('Commission must be created before funding');
    }
    this._status = CommissionStatus.FUNDED;
    if (txSignature) this._txSignatures.fund = txSignature;
    this._updatedAt = new Date();
  }

  accept(providerId: string, txSignature?: string): void {
    if (this._status !== CommissionStatus.FUNDED) {
      throw new Error('Commission must be funded before acceptance');
    }
    if (this._providerId && this._providerId !== providerId) {
       throw new Error('Commission is assigned to another provider');
    }
    this._providerId = providerId;
    this._status = CommissionStatus.ACCEPTED;
    if (txSignature) this._txSignatures.accept = txSignature;
    this._updatedAt = new Date();
  }

  startWork(): void {
    if (this._status !== CommissionStatus.ACCEPTED) {
      throw new Error('Commission must be accepted first');
    }
    this._status = CommissionStatus.IN_PROGRESS;
    this._startedAt = new Date();
    this._updatedAt = new Date();
  }

  deliverWork(artworkUrl: string, hash: string, txSignature?: string): void {
    if (this._status !== CommissionStatus.IN_PROGRESS) {
      throw new Error('Commission is not in progress');
    }
    this._finalArtwork = artworkUrl;
    this._finalArtworkHash = hash;
    this._status = CommissionStatus.DELIVERED;
    if (txSignature) this._txSignatures.deliver = txSignature;
    this._updatedAt = new Date();
  }

  review(rating: { score: number; review: string }, txSignature?: string): void {
    if (this._status !== CommissionStatus.DELIVERED) {
      throw new Error('Commission must be delivered before review');
    }
    this._ratingId = rating;
    this._status = CommissionStatus.REVIEWED;
    if (txSignature) this._txSignatures.review = txSignature;
    this._updatedAt = new Date();
  }

  complete(txSignature?: string): void {
     if (this._status !== CommissionStatus.REVIEWED) {
       throw new Error('Commission must be reviewed before completion');
     }
     this._status = CommissionStatus.COMPLETED;
     if (txSignature) this._txSignatures.complete = txSignature;
     this._completedAt = new Date();
     this._updatedAt = new Date();
  }

  cancel(txSignature?: string): void {
    if (this._status === CommissionStatus.COMPLETED) {
      throw new Error('Cannot cancel completed commission');
    }
    this._status = CommissionStatus.CANCELLED;
    this._cancelledAt = new Date();
    this._updatedAt = new Date();
  }

  raiseDispute(): void {
    if ([CommissionStatus.COMPLETED, CommissionStatus.CANCELLED].includes(this._status)) {
      throw new Error('Cannot dispute a completed or cancelled commission');
    }
    this._status = CommissionStatus.DISPUTE;
    this._disputeAt = new Date();
    this._updatedAt = new Date();
  }

  resolveDispute(resolution: 'refund' | 'pay_provider', txSignature?: string): void {
    if (this._status !== CommissionStatus.DISPUTE) {
      throw new Error('Commission is not in dispute');
    }
    
    if (resolution === 'refund') {
      this._status = CommissionStatus.CANCELLED;
      this._cancelledAt = new Date();
    } else {
      this._status = CommissionStatus.COMPLETED;
      this._completedAt = new Date();
    }

    if (txSignature) this._txSignatures.resolve = txSignature;
    this._updatedAt = new Date();
  }

  setEscrowAddress(address: string): void {
    this._escrowAddress = address;
    this._updatedAt = new Date();
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
      referenceImages: this._referenceImages,
      requirements: this._requirements,
      tags: this._tags,
      finalArtwork: this._finalArtwork,
      finalArtworkHash: this._finalArtworkHash,
      escrowAddress: this._escrowAddress,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      cancelledAt: this._cancelledAt,
      disputeAt: this._disputeAt,
      ratingId: this._ratingId,
      txSignatures: this._txSignatures,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
  get cancelledAt(): Date | undefined { return this._cancelledAt ? new Date(this._cancelledAt) : undefined; }
  get disputeAt(): Date | undefined { return this._disputeAt ? new Date(this._disputeAt) : undefined; }
  get ratingId(): string | { score: number; review: string } | undefined { return this._ratingId; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }

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
      referenceImages: this._referenceImages,
      requirements: this._requirements,
      tags: this._tags,
      finalArtwork: this._finalArtwork,
      finalArtworkHash: this._finalArtworkHash,
      escrowAddress: this._escrowAddress,
      startedAt: this._startedAt,
      completedAt: this._completedAt,
      cancelledAt: this._cancelledAt,
      disputeAt: this._disputeAt,
      ratingId: this._ratingId,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }

  toJSON() {
    return this.toResponse();
  }
}
