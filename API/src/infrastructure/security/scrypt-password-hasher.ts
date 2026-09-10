import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import type { PasswordHasher } from '../../domain/auth/security.ports';

const scrypt = promisify(scryptCallback);

@Injectable()
export class ScryptPasswordHasher implements PasswordHasher {
  async hash(value: string) {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  async compare(value: string, encoded: string) {
    const [algorithm, salt, storedKey] = encoded.split('$');
    if (algorithm !== 'scrypt' || !salt || !storedKey) return false;

    const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
    const storedBuffer = Buffer.from(storedKey, 'hex');
    return (
      storedBuffer.length === derivedKey.length &&
      timingSafeEqual(storedBuffer, derivedKey)
    );
  }
}
