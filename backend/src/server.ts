import 'reflect-metadata';
import '@config/env';
import { container } from 'tsyringe';
import App from '@/app';
import { UsersRepository } from '@repositories/users.repository';
import { MongooseCommissionsRepository } from '@repositories/mongoose/commissions.repository';
import { UsersRoute } from '@routes/users.route';
import { AuthRoute } from '@routes/auth.route';
import { CommissionsRoute } from '@routes/commissions.route';

// DI Registration
container.registerInstance(UsersRepository, new UsersRepository());
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
