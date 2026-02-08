// src/entities/rating.entity.ts
import crypto from 'crypto';

export interface RatingPersistenceData {
  id: string;
  commissionId: string;
  raterId: string; // User who gave the rating
  ratedUserId: string; // User who received the rating
  score: number; // 1-5
  review?: string;
  createdAt: Date;
}

export class Rating {
  private constructor(
    private readonly _id: string,
    private _commissionId: string,
    private _raterId: string,
    private _ratedUserId: string,
    private _score: number,
    private _review?: string,
    private readonly _createdAt: Date = new Date()
  ) {}

  static create(data: {
    commissionId: string;
    raterId: string;
    ratedUserId: string;
    score: number;
    review?: string;
  }): Rating {
    const id = crypto.randomUUID();
    Rating.validateScore(data.score);
    Rating.validateReview(data.review);

    return new Rating(
      id,
      data.commissionId,
      data.raterId,
      data.ratedUserId,
      data.score,
      data.review
    );
  }

  static fromPersistence(data: RatingPersistenceData): Rating {
    return new Rating(
      data.id,
      data.commissionId,
      data.raterId,
      data.ratedUserId,
      data.score,
      data.review,
      data.createdAt
    );
  }

  // Getters
  get id(): string { return this._id; }
  get commissionId(): string { return this._commissionId; }
  get raterId(): string { return this._raterId; }
  get ratedUserId(): string { return this._ratedUserId; }
  get score(): number { return this._score; }
  get review(): string | undefined { return this._review; }
  get createdAt(): Date { return new Date(this._createdAt); }

  updateReview(review: string): void {
    Rating.validateReview(review);
    this._review = review;
  }

  private static validateScore(score: number): void {
    if (score < 1 || score > 5) {
      throw new Error('Rating score must be between 1 and 5');
    }
  }

  private static validateReview(review?: string): void {
    if (review && review.length > 2000) {
      throw new Error('Review is too long (max 2000 characters)');
    }
  }

  toPersistence(): RatingPersistenceData {
    return {
      id: this._id,
      commissionId: this._commissionId,
      raterId: this._raterId,
      ratedUserId: this._ratedUserId,
      score: this._score,
      review: this._review,
      createdAt: this._createdAt,
    };
  }

  toResponse() {
    return {
      id: this._id,
      commissionId: this._commissionId,
      raterId: this._raterId,
      ratedUserId: this._ratedUserId,
      score: this._score,
      review: this._review,
      createdAt: this._createdAt,
    };
  }
}
