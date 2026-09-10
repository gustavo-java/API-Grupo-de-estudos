import type {
  CreateMedicine,
  Medicine,
  UpdateMedicine,
} from '../entities/medicine';

export const MEDICINE_REPOSITORY = Symbol('MEDICINE_REPOSITORY');

export interface MedicineRepository {
  create(data: CreateMedicine): Promise<Medicine>;
  findAll(): Promise<Medicine[]>;
  findById(id: number): Promise<Medicine | null>;
  update(id: number, data: UpdateMedicine): Promise<Medicine | null>;
  delete(id: number): Promise<Medicine | null>;
}
