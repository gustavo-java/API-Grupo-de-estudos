import type { AccessTokenPayload, AuthenticatedUser } from './auth';

export const PASSWORD_HASHER = Symbol('PASSWORD_HASHER');
export const TOKEN_SERVICE = Symbol('TOKEN_SERVICE');

export interface PasswordHasher {
  hash(value: string): Promise<string>;
  compare(value: string, hash: string): Promise<boolean>;
}

export interface TokenService {
  sign(user: AuthenticatedUser): string;
  verify(token: string): AccessTokenPayload;
}
