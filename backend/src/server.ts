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
import { ChatRoute } from '@routes/chat.route';

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
container.register('UsersRepository', { useClass: MongooseUsersRepository });
// Fix for TS2769: explicitly cast or use correct overload if possible. 
// However, tsyringe allows registering a class token with a provider.
// The error suggests that UsersRepository constructor is being treated as the options object or similar confusion.
// Let's try to remove the class registration if we are using the string token, 
// OR fix the class registration. 
// If we want to replace UsersRepository injection with MongooseUsersRepository:
// container.register(UsersRepository, { useValue: new MongooseUsersRepository() });
container.register('CommissionsRepository', { useClass: MongooseCommissionsRepository });
container.register(MongooseCommissionsRepository, { useClass: MongooseCommissionsRepository });

// Export only the createApp function
export const createApp = () => {
  const routes = [
    container.resolve(UsersRoute), 
    container.resolve(AuthRoute),
    container.resolve(CommissionsRoute),
    container.resolve(ChatRoute)
  ];
  return new App(routes);
};

// Export the createApp function as default
export default createApp;
