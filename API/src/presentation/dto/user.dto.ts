import { IsIn } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { RegisterDto } from './auth.dto';
import { USER_ROLES, type CreateUser } from '../../domain/entities/user';

export class CreateUserDto extends RegisterDto implements CreateUser {
  @IsIn(USER_ROLES)
  roles: CreateUser['roles'];
}
export class UpdateUserDto extends PartialType(CreateUserDto, {
  skipNullProperties: false,
}) {}
