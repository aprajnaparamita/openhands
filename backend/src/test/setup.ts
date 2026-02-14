import 'reflect-metadata';
import { container } from 'tsyringe';
import App from '@/app';
import { AuthRoute } from '@routes/auth.route';
import { UsersRoute } from '@routes/users.route';
import { CommissionsRoute } from '@routes/commissions.route';
import { UsersRepository, IUsersRepository } from '@repositories/users.repository';
import { ICommissionsRepository } from '@repositories/mongoose/commissions.repository';
import { MockCommissionsRepository } from './mocks/commissions.repository';
import { ChatService } from '@services/chat.service';
import { MockChatService } from './mocks/chat.service';

let sharedRepo: UsersRepository;
let sharedCommissionsRepo: MockCommissionsRepository;

export function createTestApp({ 
  mockRepo,
  mockCommissionsRepo
}: { 
  mockRepo?: IUsersRepository;
  mockCommissionsRepo?: ICommissionsRepository;
} = {}) {
  // Users Repo Setup
  if (!sharedRepo) {
    sharedRepo = new UsersRepository();
    container.registerInstance(UsersRepository, sharedRepo);
  }
  if (mockRepo) {
    container.registerInstance(UsersRepository, mockRepo as UsersRepository);
  }

  // Commissions Repo Setup
  if (!sharedCommissionsRepo) {
    sharedCommissionsRepo = new MockCommissionsRepository();
    container.registerInstance('CommissionsRepository', sharedCommissionsRepo);
  }
  if (mockCommissionsRepo) {
    container.registerInstance('CommissionsRepository', mockCommissionsRepo);
  }

  // Chat Service Mock
  container.register(ChatService, { useClass: MockChatService });

  // Resolve Routes
  const routes = [
    container.resolve(UsersRoute), 
    container.resolve(AuthRoute),
    container.resolve(CommissionsRoute)
  ];
  
  const appInstance = new App(routes);
  return appInstance.getServer();
}

export function resetUserDB() {
  if (sharedRepo) {
    sharedRepo.reset();
  }
  if (sharedCommissionsRepo) {
    sharedCommissionsRepo.reset();
  }
}
