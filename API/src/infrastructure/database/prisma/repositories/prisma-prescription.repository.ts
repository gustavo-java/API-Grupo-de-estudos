import { Injectable } from '@nestjs/common';
import { DomainError } from '../../../../domain/domain.error';
import { hasPrismaCode } from '../prisma-error';
import { PrismaService } from '../prisma.service';
import type {
  CreatePrescription,
  UpdatePrescription,
} from '../../../../domain/entities/prescription';
import type { PrescriptionRepository } from '../../../../domain/repositories/prescription.repository';

@Injectable()
export class PrismaPrescriptionRepository implements PrescriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWithStockReduction(data: CreatePrescription) {
    return this.prisma.$transaction(async (transaction) => {
      const result = await transaction.medicine.updateMany({
        where: {
          id: data.medicineId,
          stock: { gte: data.quantity },
        },
        data: { stock: { decrement: data.quantity } },
      });

      if (result.count === 0) {
        const medicine = await transaction.medicine.findUnique({
          where: { id: data.medicineId },
          select: { stock: true },
        });
        throw new DomainError(
          medicine ? 'INSUFFICIENT_STOCK' : 'ENTITY_NOT_FOUND',
          medicine
            ? `Estoque insuficiente. Estoque atual: ${medicine.stock}.`
            : `Medicamento com ID ${data.medicineId} não encontrado.`,
        );
      }

      return transaction.prescription.create({ data });
    });
  }

  findAll() {
    return this.prisma.prescription.findMany();
  }

  findById(id: number) {
    return this.prisma.prescription.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdatePrescription) {
    try {
      return await this.prisma.prescription.update({ where: { id }, data });
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) return null;
      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.prescription.delete({ where: { id } });
    } catch (error) {
      if (hasPrismaCode(error, 'P2025')) return null;
      throw error;
    }
  }
}
