import 'reflect-metadata';
import { MONGO_URI } from '@config/env';
import { container } from 'tsyringe';
import mongoose from 'mongoose';
import App from '@/app';
import { UsersRepository } from '@repositories/users.repository';
import { MongooseUsersRepository } from '@repositories/mongoose/users.repository';
import { MongooseCommissionsRepository } from '@repositories/mongoose/commissions.repository';
import { UsersRoute } from '@routes/users.route';
import { AuthRoute } from '@routes/auth.route';
import { CommissionsRoute } from '@routes/commissions.route';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

// DI Registration
// Use Mongoose repository instead of in-memory
container.register(UsersRepository, { useClass: MongooseUsersRepository });
container.register('CommissionsRepository', { useClass: MongooseCommissionsRepository });

// Export only the createApp function
export const createApp = () => {
  const routes = [
    container.resolve(UsersRoute), 
    container.resolve(AuthRoute),
    container.resolve(CommissionsRoute)
  ];
  return new App(routes);
};

// Export the createApp function as default
export default createApp;
