import { singleton } from 'tsyringe';
import { Rating, RatingPersistenceData } from '../../entities/rating.entity.js';
import { RatingModel } from '../../infrastructure/mongoose/schemas/rating.schema.js';

export interface IRatingsRepository {
  save(rating: Rating): Promise<Rating>;
  findByRatedUserId(userId: string): Promise<Rating[]>;
  findByCommissionId(commissionId: string): Promise<Rating | undefined>;
}

@singleton()
export class MongooseRatingsRepository implements IRatingsRepository {
  async save(rating: Rating): Promise<Rating> {
    const persistenceData = rating.toPersistence();
    const ratingDoc = new RatingModel({
      _id: persistenceData.id,
      ...persistenceData,
    });
    await ratingDoc.save();
    return rating;
  }

  async findByRatedUserId(userId: string): Promise<Rating[]> {
    const ratings = await RatingModel.find({ ratedUserId: userId }).sort({ createdAt: -1 }).lean();
    return ratings.map((r: any) => Rating.fromPersistence(this.mapToPersistence(r)));
  }

  async findByCommissionId(commissionId: string): Promise<Rating | undefined> {
    const rating = await RatingModel.findOne({ commissionId }).lean();
    return rating ? Rating.fromPersistence(this.mapToPersistence(rating)) : undefined;
  }

  private mapToPersistence(doc: any): RatingPersistenceData {
    return {
      id: doc._id || doc.id,
      commissionId: doc.commissionId,
      raterId: doc.raterId,
      ratedUserId: doc.ratedUserId,
      score: doc.score,
      review: doc.review,
      createdAt: doc.createdAt,
    };
  }
}
