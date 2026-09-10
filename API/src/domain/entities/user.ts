export enum UserRole {
  ADMIN = 'Admin',
  PHARMACY = 'Farmacia',
  USER = 'Usuario',
}

export const USER_ROLES = Object.values(UserRole);

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  roles: UserRole;
  timeAcc: Date;
}

export interface CreateUser {
  name: string;
  email: string;
  password: string;
  roles: UserRole;
}

export type UpdateUser = Partial<CreateUser>;
export type PublicUser = Omit<User, 'password'>;
