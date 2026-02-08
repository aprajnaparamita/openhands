import 'reflect-metadata';
import '@config/env';
import { container } from 'tsyringe';
import App from '@/app';
import { UsersRepository } from '@repositories/users.repository';
import { UsersRoute } from '@routes/users.route';
import { AuthRoute } from '@routes/auth.route';

// DI Registration
container.registerInstance(UsersRepository, new UsersRepository());

// Export only the createApp function
export const createApp = () => {
  const routes = [container.resolve(UsersRoute), container.resolve(AuthRoute)];
  return new App(routes);
};

// Export the createApp function as default
export default createApp;
