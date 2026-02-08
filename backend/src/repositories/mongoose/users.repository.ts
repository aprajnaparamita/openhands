// src/repositories/mongoose/users.repository.ts
import { singleton } from 'tsyringe';
import mongoose from 'mongoose';
import { User, UserPersistenceData, UserType } from '@entities/user.entity';
import { IUsersRepository } from '../users.repository';
import { UserModel } from '@infrastructure/mongoose/schemas/user.schema';

@singleton()
export class MongooseUsersRepository implements IUsersRepository {
  async findAll(): Promise<User[]> {
    const users = await UserModel.find().lean();
    return users.map(user => User.fromPersistence(this.mapToPersistence(user)));
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? User.fromPersistence(this.mapToPersistence(user)) : undefined;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    return user ? User.fromPersistence(this.mapToPersistence(user)) : undefined;
  }

  async save(user: User): Promise<User> {
    const persistenceData = user.toPersistence();
    const userDoc = new UserModel({
      _id: persistenceData.id,
      ...persistenceData,
    });
    await userDoc.save();
    return user;
  }

  async update(id: string, user: User): Promise<User | undefined> {
    const persistenceData = user.toPersistence();
    const updated = await UserModel.findByIdAndUpdate(
      id,
      { ...persistenceData, updatedAt: new Date() },
      { new: true, lean: true }
    );
    return updated ? User.fromPersistence(this.mapToPersistence(updated)) : undefined;
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async findProviders(limit: number = 20, offset: number = 0): Promise<User[]> {
    const providers = await UserModel.find({ userType: UserType.PROVIDER })
      .sort({ 'cachedAverageRating': -1, 'cachedTotalRatings': -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    
    return providers.map(provider => User.fromPersistence(this.mapToPersistence(provider)));
  }

  async findAvailableProviders(limit: number = 20, offset: number = 0): Promise<User[]> {
    const providers = await UserModel.find({ 
      userType: UserType.PROVIDER,
      isAvailable: true 
    })
      .sort({ 'cachedAverageRating': -1, 'cachedTotalRatings': -1 })
      .skip(offset)
      .limit(limit)
      .lean();
    
    return providers.map(provider => User.fromPersistence(this.mapToPersistence(provider)));
  }

  async updateCachedRating(userId: string, averageRating: number, totalRatings: number): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      cachedAverageRating: averageRating,
      cachedTotalRatings: totalRatings,
      updatedAt: new Date(),
    });
  }

  private mapToPersistence(mongooseDoc: any): UserPersistenceData {
    return {
      id: mongooseDoc._id || mongooseDoc.id,
      email: mongooseDoc.email,
      password: mongooseDoc.password,
      userType: mongooseDoc.userType,
      profileImage: mongooseDoc.profileImage,
      headerImage: mongooseDoc.headerImage,
      bio: mongooseDoc.bio,
      workDescription: mongooseDoc.workDescription,
      isAvailable: mongooseDoc.isAvailable,
      cachedAverageRating: mongooseDoc.cachedAverageRating,
      cachedTotalRatings: mongooseDoc.cachedTotalRatings || 0,
      createdAt: mongooseDoc.createdAt,
      updatedAt: mongooseDoc.updatedAt,
    };
  }
}
