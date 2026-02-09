import jwt from 'jsonwebtoken';
const { sign } = jwt;
import { injectable, inject } from 'tsyringe';
import { NODE_ENV, SECRET_KEY } from '@config/env';
import { HttpException } from '@exceptions/httpException';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { User, type UserCreateData } from '@entities/user.entity';
import { UsersRepository } from '@repositories/users.repository';
import type { IUsersRepository } from '@repositories/users.repository';

@injectable()
export class AuthService {
  constructor(@inject(UsersRepository) private usersRepository: IUsersRepository) {}

  private createToken(user: User): TokenData {
    if (!SECRET_KEY) throw new Error('SECRET_KEY is not defined');

    if (user.id === undefined) {
      throw new Error('User id is undefined');
    }

    const dataStoredInToken: DataStoredInToken = { id: user.id };
    const expiresIn = 60 * 60; // 1h
    const token = sign(dataStoredInToken, SECRET_KEY as string, { expiresIn });
    return { expiresIn, token };
  }

  private createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${
      tokenData.expiresIn
    }; Path=/; SameSite=Lax;${NODE_ENV === 'production' ? ' Secure;' : ''}`;
  }

  public async signup(userData: UserCreateData): Promise<User> {
    const findUser = await this.usersRepository.findByEmail(userData.email);
    if (findUser) throw new HttpException(409, `Email is already in use`);

    // Create using the factory method of the Entity class (all validation is handled automatically)
    const newUser = await User.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }

  public async login(loginData: {
    email: string;
    password: string;
  }): Promise<{ cookie: string; user: User }> {
    const findUser = await this.usersRepository.findByEmail(loginData.email);
    if (!findUser) throw new HttpException(401, `Invalid email or password.`);

    // Password verification using the domain method of the Entity
    const isPasswordMatching = await findUser.verifyPassword(loginData.password);
    if (!isPasswordMatching) throw new HttpException(401, 'Password is incorrect');

    const tokenData = this.createToken(findUser);
    const cookie = this.createCookie(tokenData);

    return { cookie, user: findUser };
  }

  public async logout(user: User): Promise<void> {
    // In a real service, logout can be implemented by blacklisting the session/refresh token on the server
    // Here, deleting the client's cookie is sufficient
    console.log(`User with email ${user.email} logged out.`);

    return;
  }
}
