
import 'reflect-metadata';
import mongoose from 'mongoose';
import { MONGO_URI } from './config/env';
import { MongooseUsersRepository } from './repositories/mongoose/users.repository';
import { User } from './entities/user.entity';

async function test() {
  try {
    console.log('Connecting to:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const repo = new MongooseUsersRepository();
    const testWallet = '0xTestWallet_' + Date.now();
    
    console.log('Creating user...');
    const user = await User.create({
      walletAddress: testWallet,
      role: 'artist'
    });
    
    await repo.save(user);
    console.log('User saved:', user.id);

    console.log('Retrieving user...');
    const retrieved = await repo.findById(user.id);
    
    if (!retrieved) {
      console.error('User not found!');
    } else {
      console.log('User retrieved:', retrieved.toPersistence());
      if (retrieved.role === 'artist') {
        console.log('SUCCESS: Role is persisted.');
      } else {
        console.error('FAILURE: Role is MISSING.', retrieved.role);
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

test();
