import 'reflect-metadata';
import { container } from 'tsyringe';
import App from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UsersRoute } from '@routes/users.route';
import { UsersRepository, IUsersRepository } from '@repositories/users.repository';

let sharedRepo: UsersRepository;

export function createTestApp({ mockRepo }: { mockRepo?: IUsersRepository } = {}) {
  // If you always want to inject a new instance, reset logic is needed
  if (!sharedRepo) {
    sharedRepo = new UsersRepository();
    container.registerInstance(UsersRepository, sharedRepo);
  }
  // Inject if mockRepo exists
  if (mockRepo) {
    container.registerInstance(UsersRepository, mockRepo as UsersRepository);
  }

  // Inject class type directly
  const routes = [container.resolve(UsersRoute), container.resolve(AuthRoute)];
  const appInstance = new App(routes);
  return appInstance.getServer();
}

export function resetUserDB() {
  if (sharedRepo) {
    sharedRepo.reset();
  }
}
