// src/repositories/mongoose/commissions.repository.ts
import { singleton } from 'tsyringe';
import { Commission, CommissionPersistenceData, CommissionStatus } from '../../entities/commission.entity.js';
import { CommissionModel } from '../../infrastructure/mongoose/schemas/commission.schema.js';

export interface ICommissionsRepository {
  save(commission: Commission): Promise<Commission>;
  findById(id: string): Promise<Commission | undefined>;
  findByRequesterId(requesterId: string, status?: CommissionStatus): Promise<Commission[]>;
  findByProviderId(providerId: string, status?: CommissionStatus): Promise<Commission[]>;
  update(id: string, commission: Commission): Promise<Commission | undefined>;
  findByUserId(userId: string): Promise<Commission[]>;
  findAllByUserId(userId: string): Promise<Commission[]>;
}

@singleton()
export class MongooseCommissionsRepository implements ICommissionsRepository {
  async save(commission: Commission): Promise<Commission> {
    const persistenceData = commission.toPersistence();
    const commissionDoc = new CommissionModel({
      _id: persistenceData.id,
      ...persistenceData,
    });
    await commissionDoc.save();
    return commission;
  }

  async findById(id: string): Promise<Commission | undefined> {
    const commission = await CommissionModel.findById(id).lean();
    return commission ? Commission.fromPersistence(this.mapToPersistence(commission)) : undefined;
  }

  async findByRequesterId(requesterId: string, status?: CommissionStatus): Promise<Commission[]> {
    const query: any = { requesterId };
    if (status) query.status = status;
    
    const commissions = await CommissionModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return commissions.map(commission => Commission.fromPersistence(this.mapToPersistence(commission)));
  }

  async findByProviderId(providerId: string, status?: CommissionStatus): Promise<Commission[]> {
    const query: any = { providerId };
    if (status) query.status = status;
    
    const commissions = await CommissionModel.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    return commissions.map(commission => Commission.fromPersistence(this.mapToPersistence(commission)));
  }

  async update(id: string, commission: Commission): Promise<Commission | undefined> {
    const persistenceData = commission.toPersistence();
    const updated = await CommissionModel.findByIdAndUpdate(
      id,
      { ...persistenceData, updatedAt: new Date() },
      { new: true, lean: true }
    );
    return updated ? Commission.fromPersistence(this.mapToPersistence(updated)) : undefined;
  }

  async findByUserId(userId: string): Promise<Commission[]> {
    const commissions = await CommissionModel.find({
      $or: [{ requesterId: userId }, { providerId: userId }],
      status: CommissionStatus.COMPLETED,
    })
      .populate('ratingId', 'score review')
      .sort({ completedAt: -1 })
      .lean();
    
    return commissions.map(commission => Commission.fromPersistence(this.mapToPersistence(commission)));
  }

  async findAllByUserId(userId: string): Promise<Commission[]> {
    const commissions = await CommissionModel.find({
      $or: [{ requesterId: userId }, { providerId: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();
    
    return commissions.map(commission => Commission.fromPersistence(this.mapToPersistence(commission)));
  }

  private mapToPersistence(mongooseDoc: any): CommissionPersistenceData {
    return {
      id: mongooseDoc._id || mongooseDoc.id,
      title: mongooseDoc.title,
      description: mongooseDoc.description,
      requesterId: mongooseDoc.requesterId,
      providerId: mongooseDoc.providerId,
      status: mongooseDoc.status,
      price: mongooseDoc.price,
      deadline: mongooseDoc.deadline,
      referenceImages: mongooseDoc.referenceImages,
      finalArtwork: mongooseDoc.finalArtwork,
      finalArtworkHash: mongooseDoc.finalArtworkHash,
      escrowAddress: mongooseDoc.escrowAddress,
      startedAt: mongooseDoc.startedAt,
      completedAt: mongooseDoc.completedAt,
      cancelledAt: mongooseDoc.cancelledAt,
      ratingId: mongooseDoc.ratingId,
      createdAt: mongooseDoc.createdAt,
      updatedAt: mongooseDoc.updatedAt,
    };
  }
}
