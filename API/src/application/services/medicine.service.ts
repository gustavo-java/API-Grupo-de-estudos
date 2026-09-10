import { Inject, Injectable } from '@nestjs/common';
import { DomainError } from '../../domain/domain.error';
import type {
  CreateMedicine,
  UpdateMedicine,
} from '../../domain/entities/medicine';
import {
  MEDICINE_REPOSITORY,
  type MedicineRepository,
} from '../../domain/repositories/medicine.repository';

@Injectable()
export class MedicineService {
  constructor(
    @Inject(MEDICINE_REPOSITORY)
    private readonly medicines: MedicineRepository,
  ) {}

  create(data: CreateMedicine) {
    return this.medicines.create(data);
  }

  findAll() {
    return this.medicines.findAll();
  }

  async findOne(id: number) {
    const medicine = await this.medicines.findById(id);
    if (!medicine) {
      throw new DomainError(
        'ENTITY_NOT_FOUND',
        `Medicamento com ID ${id} não encontrado.`,
      );
    }
    return medicine;
  }

  async update(id: number, data: UpdateMedicine) {
    const medicine = await this.medicines.update(id, data);
    if (!medicine) {
      throw new DomainError(
        'ENTITY_NOT_FOUND',
        `Medicamento com ID ${id} não encontrado.`,
      );
    }
    return medicine;
  }

  async remove(id: number) {
    const medicine = await this.medicines.delete(id);
    if (!medicine) {
      throw new DomainError(
        'ENTITY_NOT_FOUND',
        `Medicamento com ID ${id} não encontrado.`,
      );
    }
    return medicine;
  }
}
