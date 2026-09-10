import type { Request } from 'express';
import type { AuthenticatedUser } from '../../domain/auth/auth';

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}
