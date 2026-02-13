import { User, type UserCreateData } from '@entities/user.entity';

describe('User Entity', () => {
  const validUserData: UserCreateData = {
    walletAddress: 'valid-wallet-address',
    role: 'artist',
    name: 'Test Artist',
  };

  describe('create', () => {
    it('should create a new user with valid data', async () => {
      const user = await User.create(validUserData);

      expect(user.id).toBeDefined();
      expect(user.walletAddress).toBe('valid-wallet-address');
      expect(user.role).toBe('artist');
      expect(user.name).toBe('Test Artist');
      expect(user.isAvailable).toBe(true); // default
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create a user without optional fields', async () => {
      const user = await User.create({ walletAddress: 'wallet-only' });
      expect(user.walletAddress).toBe('wallet-only');
      expect(user.role).toBeUndefined();
      expect(user.name).toBeUndefined();
    });
  });

  describe('fromPersistence', () => {
    it('should restore user from persistence data', () => {
      const persistenceData = {
        id: 'user_123',
        walletAddress: 'restored-wallet',
        role: 'requester',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      };

      const user = User.fromPersistence(persistenceData);

      expect(user.id).toBe('user_123');
      expect(user.walletAddress).toBe('restored-wallet');
      expect(user.role).toBe('requester');
      expect(user.createdAt).toEqual(new Date('2025-01-01'));
      expect(user.updatedAt).toEqual(new Date('2025-01-02'));
    });

    it('should use default dates if not provided', () => {
      const persistenceData = {
        id: 'user_123',
        walletAddress: 'wallet',
      };

      const user = User.fromPersistence(persistenceData);

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('updateProfile', () => {
    it('should update profile fields', async () => {
      const user = await User.create({ walletAddress: 'wallet' });
      const initialUpdatedAt = user.updatedAt;

      // Small delay to ensure updatedAt changes
      await new Promise((r) => setTimeout(r, 10));

      await user.updateProfile({
        name: 'New Name',
        bio: 'New Bio',
        isAvailable: false,
      });

      expect(user.name).toBe('New Name');
      expect(user.bio).toBe('New Bio');
      expect(user.isAvailable).toBe(false);
      expect(user.updatedAt.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
    });

    it('should not update if values are same', async () => {
      const user = await User.create({ walletAddress: 'wallet', name: 'Name' });
      const initialUpdatedAt = user.updatedAt;

      await user.updateProfile({ name: 'Name' });

      expect(user.updatedAt).toEqual(initialUpdatedAt);
    });
  });
});
