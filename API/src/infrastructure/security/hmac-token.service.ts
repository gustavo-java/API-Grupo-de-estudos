import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import type {
  AccessTokenPayload,
  AuthenticatedUser,
} from '../../domain/auth/auth';
import type { TokenService } from '../../domain/auth/security.ports';
import { USER_ROLES } from '../../domain/entities/user';

@Injectable()
export class HmacTokenService implements TokenService {
  private readonly secret: string;
  private readonly expiresIn = Number(process.env.JWT_EXPIRES_IN ?? 3600);

  constructor() {
    if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
      throw new Error('Configure JWT_SECRET antes de iniciar em produção.');
    }
    // Never use a public, predictable signing key when a local secret is absent.
    this.secret = process.env.JWT_SECRET || randomBytes(48).toString('hex');
    if (!Number.isFinite(this.expiresIn) || this.expiresIn <= 0) {
      throw new Error(
        'JWT_EXPIRES_IN deve ser um número positivo de segundos.',
      );
    }
  }

  sign(user: AuthenticatedUser) {
    const now = Math.floor(Date.now() / 1000);
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const payload = this.encode({
      ...user,
      iat: now,
      exp: now + this.expiresIn,
    });
    return `${header}.${payload}.${this.signature(`${header}.${payload}`)}`;
  }

  verify(token: string): AccessTokenPayload {
    if (token.split('.').length !== 3) this.unauthorized();
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) this.unauthorized();

    const expected = this.signature(`${header}.${payload}`);
    const actualBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (
      actualBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(actualBuffer, expectedBuffer)
    ) {
      this.unauthorized();
    }

    try {
      const decoded = JSON.parse(
        Buffer.from(payload, 'base64url').toString('utf8'),
      ) as AccessTokenPayload;
      if (
        !decoded.sub ||
        !decoded.email ||
        !USER_ROLES.includes(decoded.role) ||
        !Number.isFinite(decoded.exp) ||
        decoded.exp <= Date.now() / 1000
      ) {
        this.unauthorized();
      }
      return decoded;
    } catch {
      return this.unauthorized();
    }
  }

  private encode(value: object) {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }

  private signature(value: string) {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private unauthorized(): never {
    throw new UnauthorizedException('Token inválido ou expirado.');
  }
}
