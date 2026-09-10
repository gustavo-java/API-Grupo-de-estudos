import type { UserRole } from '../entities/user';

export interface AuthenticatedUser {
  sub: number;
  email: string;
  role: UserRole;
}

export interface AccessTokenPayload extends AuthenticatedUser {
  iat: number;
  exp: number;
}
