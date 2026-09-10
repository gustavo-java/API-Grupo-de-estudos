import { IsInt, IsOptional, IsPositive } from 'class-validator';
import type { CreatePrescription } from '../../domain/entities/prescription';

export class CreatePrescriptionDto implements CreatePrescription {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsInt()
  @IsPositive()
  medicineId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

export class UpdatePrescriptionDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  userId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  medicineId?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;
}
