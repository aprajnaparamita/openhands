import { User, type UserCreateData } from '@entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';
import { UsersService } from '@services/users.service';

describe('UsersService (with UsersRepository)', () => {
  let usersService: UsersService;
  let userRepo: UsersRepository;

  beforeEach(async () => {
    userRepo = new UsersRepository();
    userRepo.reset();

    // Create test users using Entity
    const user1 = await User.create({
      walletAddress: 'wallet1',
    });
    const user2 = await User.create({
      walletAddress: 'wallet2',
    });

    await userRepo.save(user1);
    await userRepo.save(user2);
    usersService = new UsersService(userRepo);
  });

  it('getAllUsers: should return all users', async () => {
    const users = await usersService.getAllUsers();
    expect(users.length).toBe(2);
    expect(users.map((u) => u.walletAddress)).toContain('wallet1');
    expect(users.map((u) => u.walletAddress)).toContain('wallet2');
  });

  it('getUserById: should return user by ID', async () => {
    const users = await usersService.getAllUsers();
    const targetUser = users.find((u) => u.walletAddress === 'wallet2');
    expect(targetUser).toBeDefined();

    const user = await usersService.getUserById(targetUser!.id);
    expect(user.walletAddress).toBe('wallet2');
  });

  it('getUserById: should throw if ID does not exist', async () => {
    await expect(usersService.getUserById('999')).rejects.toThrow(/not found/);
  });

  it('createUser: should add a new user', async () => {
    const userData: UserCreateData = {
      walletAddress: 'wallet3',
    };

    const created = await usersService.createUser(userData);
    expect(created.walletAddress).toBe('wallet3');
    const all = await usersService.getAllUsers();
    expect(all.length).toBe(3);
  });

  it('createUser: should throw if walletAddress already exists', async () => {
    const userData: UserCreateData = {
      walletAddress: 'wallet1', // already exists
    };

    await expect(usersService.createUser(userData)).rejects.toThrow(/exists/);
  });

  it('updateUser: should update user profile', async () => {
    const users = await usersService.getAllUsers();
    const targetUser = users.find((u) => u.walletAddress === 'wallet2');
    expect(targetUser).toBeDefined();

    const updateData = {
      name: 'Updated Name',
      bio: 'Updated Bio',
    };

    const updated = await usersService.updateUser(targetUser!.id, updateData);
    expect(updated).toBeDefined();
    expect(updated.name).toBe('Updated Name');
    expect(updated.bio).toBe('Updated Bio');
  });

  it('updateUser: should throw if ID does not exist', async () => {
    const updateData = {
      name: 'New Name',
    };

    await expect(usersService.updateUser('nonexistent-id', updateData)).rejects.toThrow(
      /not found/,
    );
  });

  it('deleteUser: should delete user successfully', async () => {
    const users = await usersService.getAllUsers();
    const userToDelete = users.find((u) => u.walletAddress === 'wallet1');
    expect(userToDelete).toBeDefined();

    await usersService.deleteUser(userToDelete!.id);
    const remaining = await usersService.getAllUsers();
    expect(remaining.length).toBe(1);
    expect(remaining[0].walletAddress).toBe('wallet2');
  });

  it('deleteUser: should return false/throw if user not found', async () => {
    const result = await usersService.deleteUser('nonexistent-id');
    expect(result).toBe(false);
  });
});
