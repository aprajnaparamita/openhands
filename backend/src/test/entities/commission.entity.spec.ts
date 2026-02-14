import { Commission, CommissionStatus } from '../../entities/commission.entity';

describe('Commission Entity - Dispute Logic', () => {
  let commission: Commission;

  beforeEach(() => {
    commission = Commission.create({
      title: 'Test Project',
      description: 'Description',
      requesterId: 'req1',
      price: 100
    });
    // Manually advance state for testing
    (commission as any)._status = CommissionStatus.IN_PROGRESS;
  });

  it('should raise dispute from IN_PROGRESS', () => {
    commission.raiseDispute();
    expect(commission.status).toBe(CommissionStatus.DISPUTE);
    expect(commission.disputeAt).toBeDefined();
  });

  it('should not raise dispute if already completed', () => {
    (commission as any)._status = CommissionStatus.COMPLETED;
    expect(() => commission.raiseDispute()).toThrow('Cannot dispute a completed or cancelled commission');
  });

  it('should resolve dispute to CANCELLED (refund)', () => {
    commission.raiseDispute();
    commission.resolveDispute('refund');
    expect(commission.status).toBe(CommissionStatus.CANCELLED);
    expect(commission.cancelledAt).toBeDefined();
  });

  it('should resolve dispute to COMPLETED (pay provider)', () => {
    commission.raiseDispute();
    commission.resolveDispute('pay_provider');
    expect(commission.status).toBe(CommissionStatus.COMPLETED);
    expect(commission.completedAt).toBeDefined();
  });

  it('should throw if resolving when not in dispute', () => {
    expect(() => commission.resolveDispute('refund')).toThrow('Commission is not in dispute');
  });
});
