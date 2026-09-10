import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../domain/domain.error';
import { hasPrismaCode } from '../prisma-error';
import { PrismaService } from '../prisma.service';
import {
  USER_ROLES,
  UserRole,
  type CreateUser,
  type UpdateUser,
  type User,
} from '../../../../domain/entities/user';
import type { UserRepository } from '../../../../domain/repositories/user.repository';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async register(data: Omit<CreateUser, 'roles'>) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Serialize registration with all user inserts, including simultaneous signups.
        await tx.$executeRaw`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE`;
        const roles =
          (await tx.user.count()) === 0 ? UserRole.ADMIN : UserRole.USER;
        return this.toDomain(
          await tx.user.create({ data: { ...data, roles } }),
        );
      });
    } catch (error) {
      if (hasPrismaCode(error, 'P2002')) {
        throw new DomainError('CONFLICT', 'Este e-mail já está cadastrado.');
      }
      throw error;
    }
  }

  async create(data: CreateUser) {
    try {
      return this.toDomain(await this.prisma.user.create({ data }));
    } catch (error) {
      if (hasPrismaCode(error, 'P2002')) {
        throw new DomainError('CONFLICT', 'Este e-mail já está cadastrado.');
      }
      throw error;
    }
  }

  async findAll() {
    return (await this.prisma.user.findMany()).map((user) =>
      this.toDomain(user),
    );
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.toDomain(user) : null;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    return user ? this.toDomain(user) : null;
  }

  async update(id: number, data: UpdateUser) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE`;
        const current = await tx.user.findUnique({ where: { id } });
        if (!current) return null;
        if (
          this.toDomain(current).roles === UserRole.ADMIN &&
          data.roles &&
          data.roles !== UserRole.ADMIN &&
          (await tx.user.count({ where: { roles: UserRole.ADMIN } })) <= 1
        ) {
          throw new DomainError(
            'CONFLICT',
            'Não é possível alterar a função do último administrador.',
          );
        }
        return this.toDomain(await tx.user.update({ where: { id }, data }));
      });
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) return null;
      if (hasPrismaCode(error, 'P2002')) {
        throw new DomainError('CONFLICT', 'Este e-mail já está cadastrado.');
      }
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$executeRaw`LOCK TABLE "User" IN SHARE ROW EXCLUSIVE MODE`;
        const current = await tx.user.findUnique({ where: { id } });
        if (!current) return null;
        if (
          this.toDomain(current).roles === UserRole.ADMIN &&
          (await tx.user.count({ where: { roles: UserRole.ADMIN } })) <= 1
        ) {
          throw new DomainError(
            'CONFLICT',
            'Não é possível excluir o último administrador.',
          );
        }
        return this.toDomain(await tx.user.delete({ where: { id } }));
      });
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) return null;
      if (hasPrismaCode(error, 'P2003'))
        throw new DomainError(
          'CONFLICT',
          'Este usuário possui receitas vinculadas e não pode ser excluído.',
        );
      throw error;
    }
  }

  async exists(id: number) {
    return (await this.prisma.user.count({ where: { id } })) > 0;
  }

  private toDomain(user: Omit<User, 'roles'> & { roles: string }): User {
    if (!USER_ROLES.includes(user.roles as UserRole)) {
      throw new Error(`Cargo inválido armazenado para o usuário ${user.id}.`);
    }
    return { ...user, roles: user.roles as UserRole };
  }
}
