import type {
  CreatePrescription,
  Prescription,
  UpdatePrescription,
} from '../entities/prescription';

export const PRESCRIPTION_REPOSITORY = Symbol('PRESCRIPTION_REPOSITORY');

export interface PrescriptionRepository {
  createWithStockReduction(data: CreatePrescription): Promise<Prescription>;
  findAll(): Promise<Prescription[]>;
  findById(id: number): Promise<Prescription | null>;
  update(id: number, data: UpdatePrescription): Promise<Prescription | null>;
  delete(id: number): Promise<Prescription | null>;
}
