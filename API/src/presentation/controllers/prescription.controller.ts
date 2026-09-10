import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { PrescriptionService } from '../../application/services/prescription.service';
import { UserRole } from '../../domain/entities/user';
import { Roles } from '../auth/auth.decorators';
import {
  CreatePrescriptionDto,
  UpdatePrescriptionDto,
} from '../dto/prescription.dto';

@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: CreatePrescriptionDto) {
    return this.prescriptionService.create(data);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.prescriptionService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePrescriptionDto,
  ) {
    return this.prescriptionService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.prescriptionService.remove(id);
  }
}
