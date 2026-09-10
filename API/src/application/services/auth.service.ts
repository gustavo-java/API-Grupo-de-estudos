import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';
import {
  PASSWORD_HASHER,
  TOKEN_SERVICE,
  type PasswordHasher,
  type TokenService,
} from '../../domain/auth/security.ports';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER) private readonly passwords: PasswordHasher,
    @Inject(TOKEN_SERVICE) private readonly tokens: TokenService,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const user = await this.users.register({
      ...data,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: await this.passwords.hash(data.password),
    });
    return this.toSession(user);
  }

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user || !(await this.passwords.compare(password, user.password))) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }
    return this.toSession(user);
  }

  async me(id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new UnauthorizedException('Conta não encontrada.');
    return {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.roles,
    };
  }

  private toSession(user: Awaited<ReturnType<UserRepository['create']>>) {
    const authenticatedUser = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.roles,
    };
    return {
      accessToken: this.tokens.sign(authenticatedUser),
      user: authenticatedUser,
    };
  }
}
