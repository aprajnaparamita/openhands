import { ICommissionsRepository } from '../../repositories/mongoose/commissions.repository';
import { Commission, CommissionStatus, CommissionPersistenceData } from '../../entities/commission.entity';

export class MockCommissionsRepository implements ICommissionsRepository {
  private commissions: CommissionPersistenceData[] = [];

  async save(commission: Commission): Promise<Commission> {
    const data = commission.toPersistence();
    this.commissions.push(data);
    return commission;
  }

  async findById(id: string): Promise<Commission | undefined> {
    const data = this.commissions.find(c => c.id === id);
    return data ? Commission.fromPersistence(data) : undefined;
  }

  async findByRequesterId(requesterId: string, status?: CommissionStatus): Promise<Commission[]> {
    let data = this.commissions.filter(c => c.requesterId === requesterId);
    if (status) data = data.filter(c => c.status === status);
    return data.map(d => Commission.fromPersistence(d));
  }

  async findByProviderId(providerId: string, status?: CommissionStatus): Promise<Commission[]> {
    let data = this.commissions.filter(c => c.providerId === providerId);
    if (status) data = data.filter(c => c.status === status);
    return data.map(d => Commission.fromPersistence(d));
  }

  async update(id: string, commission: Commission): Promise<Commission | undefined> {
    const idx = this.commissions.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    this.commissions[idx] = commission.toPersistence();
    return commission;
  }

  async findByUserId(userId: string): Promise<Commission[]> {
    return this.commissions
      .filter(c => c.requesterId === userId || c.providerId === userId)
      .map(d => Commission.fromPersistence(d));
  }

  async findAllByUserId(userId: string): Promise<Commission[]> {
    return this.commissions
      .filter(c => c.requesterId === userId || c.providerId === userId)
      .map(d => Commission.fromPersistence(d));
  }

  async findAvailable(): Promise<Commission[]> {
    return this.commissions
      .filter(c => c.status === CommissionStatus.FUNDED && !c.providerId)
      .map(d => Commission.fromPersistence(d));
  }

  async findDisputed(): Promise<Commission[]> {
    return this.commissions
      .filter(c => c.status === CommissionStatus.DISPUTE)
      .map(d => Commission.fromPersistence(d));
  }

  async getStats(): Promise<{ totalVolume: number; completedCount: number; disputeCount: number }> {
    const completed = this.commissions.filter(c => c.status === CommissionStatus.COMPLETED);
    const disputed = this.commissions.filter(c => c.status === CommissionStatus.DISPUTE);
    const totalVolume = completed.reduce((sum, c) => sum + c.price, 0);

    return {
      totalVolume,
      completedCount: completed.length,
      disputeCount: disputed.length
    };
  }

  reset() {
    this.commissions = [];
  }
}
