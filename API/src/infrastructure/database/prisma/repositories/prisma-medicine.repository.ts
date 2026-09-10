import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../domain/domain.error';
import type {
  CreateMedicine,
  UpdateMedicine,
} from '../../../../domain/entities/medicine';
import type { MedicineRepository } from '../../../../domain/repositories/medicine.repository';
import { hasPrismaCode } from '../prisma-error';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaMedicineRepository implements MedicineRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateMedicine) {
    return this.prisma.medicine.create({ data });
  }

  findAll() {
    return this.prisma.medicine.findMany();
  }

  findById(id: number) {
    return this.prisma.medicine.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateMedicine) {
    try {
      return await this.prisma.medicine.update({ where: { id }, data });
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) return null;
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.medicine.delete({ where: { id } });
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) return null;
      if (hasPrismaCode(error, 'P2003')) {
        throw new DomainError(
          'CONFLICT',
          'Este produto possui receitas vinculadas e não pode ser excluído.',
        );
      }
      throw error;
    }
  }
}
