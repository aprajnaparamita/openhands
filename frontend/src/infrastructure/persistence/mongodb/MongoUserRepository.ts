// src/infrastructure/persistence/mongodb/MongoUserRepository.ts
import { Model, model, Schema } from 'mongoose';
import { User, UserPersistenceData } from '../../../domain/entities/User';
import { UserRepository } from '../../../domain/repositories/UserRepository';

const userSchema = new Schema<UserPersistenceData>({
  id: { type: String, required: true, unique: true },
  walletAddress: { type: String, required: true, unique: true, index: true },
  role: { type: String, enum: ['artist', 'requester'] },
  name: String,
  bio: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserModel = model<UserPersistenceData>('User', userSchema);

export class MongoUserRepository implements UserRepository {
  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    const userData = await UserModel.findOne({ walletAddress: walletAddress.toLowerCase() }).lean();
    return userData ? User.fromPersistence(userData) : null;
  }

  async findById(id: string): Promise<User | null> {
    const userData = await UserModel.findOne({ id }).lean();
    return userData ? User.fromPersistence(userData) : null;
  }

  async save(user: User): Promise<User> {
    const userData = user.toPersistence();
    await new UserModel(userData).save();
    return user;
  }

  async update(user: User): Promise<User> {
    const userData = user.toPersistence();
    await UserModel.updateOne({ id: user.id }, { $set: userData });
    return user;
  }
}
