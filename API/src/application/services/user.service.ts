import { Inject, Injectable } from '@nestjs/common';
import {
  PASSWORD_HASHER,
  type PasswordHasher,
} from '../../domain/auth/security.ports';
import { DomainError } from '../../domain/domain.error';
import type {
  CreateUser,
  PublicUser,
  UpdateUser,
  User,
} from '../../domain/entities/user';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly users: UserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwords: PasswordHasher,
  ) {}

  async create(data: CreateUser) {
    const user = await this.users.create({
      ...data,
      password: await this.passwords.hash(data.password),
    });
    return this.withoutPassword(user);
  }

  async findAll() {
    return (await this.users.findAll()).map((user) =>
      this.withoutPassword(user),
    );
  }

  async findOne(id: number) {
    const user = await this.users.findById(id);
    if (!user) {
      throw new DomainError(
        'ENTITY_NOT_FOUND',
        `Usuário com ID ${id} não encontrado.`,
      );
    }
    return this.withoutPassword(user);
  }

  async update(id: number, data: UpdateUser) {
    const update = data.password
      ? { ...data, password: await this.passwords.hash(data.password) }
      : data;
    const user = await this.users.update(id, update);
    if (!user) {
      throw new DomainError(
        'ENTITY_NOT_FOUND',
        `Usuário com ID ${id} não encontrado.`,
      );
    }
    return this.withoutPassword(user);
  }

  async remove(id: number) {
    const user = await this.users.delete(id);
    if (!user) {
      throw new DomainError(
        'ENTITY_NOT_FOUND',
        `Usuário com ID ${id} não encontrado.`,
      );
    }
    return this.withoutPassword(user);
  }

  private withoutPassword(user: User): PublicUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      timeAcc: user.timeAcc,
    };
  }
}
