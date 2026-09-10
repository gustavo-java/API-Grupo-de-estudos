import type { CreateUser, UpdateUser, User } from '../entities/user';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  create(data: CreateUser): Promise<User>;
  register(data: Omit<CreateUser, 'roles'>): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: number, data: UpdateUser): Promise<User | null>;
  delete(id: number): Promise<User | null>;
  exists(id: number): Promise<boolean>;
}
