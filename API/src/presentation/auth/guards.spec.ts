import type { UserRepository } from '../../domain/repositories/user.repository';
import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { TokenService } from '../../domain/auth/security.ports';
import { UserRole } from '../../domain/entities/user';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

function contextFor(request: object): ExecutionContext {
  return {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({ getRequest: () => request }),
  } as unknown as ExecutionContext;
}

describe('authorization guards', () => {
  it('AuthGuard rejects requests without a bearer token', async () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const tokens = { verify: jest.fn() } as unknown as TokenService;

    await expect(
      new AuthGuard(reflector, tokens, {} as UserRepository).canActivate(
        contextFor({ headers: {} }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('AuthGuard uses the current database role instead of the token role', async () => {
    const request = { headers: { authorization: 'Bearer valid-token' } };
    const user = { sub: 1, email: 'admin@test.com', role: UserRole.ADMIN };
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(false),
    } as unknown as Reflector;
    const verify = jest.fn().mockReturnValue(user);
    const guard = new AuthGuard(
      reflector,
      {
        verify,
      } as unknown as TokenService,
      {
        findById: jest.fn().mockResolvedValue({
          id: 1,
          email: user.email,
          roles: UserRole.USER,
        }),
      } as unknown as UserRepository,
    );

    expect(await guard.canActivate(contextFor(request))).toBe(true);
    expect(verify).toHaveBeenCalledWith('valid-token');
    expect(request).toMatchObject({ user: { ...user, role: UserRole.USER } });
  });

  it('RolesGuard allows only configured roles', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue([UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);

    expect(
      guard.canActivate(
        contextFor({
          user: { sub: 1, email: 'a@a.com', role: UserRole.ADMIN },
        }),
      ),
    ).toBe(true);
    expect(
      guard.canActivate(
        contextFor({ user: { sub: 2, email: 'u@a.com', role: UserRole.USER } }),
      ),
    ).toBe(false);
  });
});
