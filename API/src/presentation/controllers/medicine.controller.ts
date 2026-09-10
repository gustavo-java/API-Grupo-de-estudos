import { ProductImportService } from '../../application/services/product-import.service';
import { ImportProductsDto } from '../dto/import-products.dto';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductImageService } from '../../infrastructure/storage/product-image.service';
import { MedicineService } from '../../application/services/medicine.service';
import { UserRole } from '../../domain/entities/user';
import { Roles } from '../auth/auth.decorators';
import { CreateMedicineDto, UpdateMedicineDto } from '../dto/medicine.dto';

@Controller('medicines')
export class MedicineController {
  constructor(
    private readonly medicineService: MedicineService,
    private readonly images: ProductImageService,
    private readonly productImport: ProductImportService,
  ) {}

  @Post('import/preview')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  preview(@UploadedFile() file?: { originalname: string; buffer: Buffer }) {
    return this.productImport.preview(file);
  }

  @Post('import')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  import(@Body() data: ImportProductsDto) {
    return this.productImport.import(data.products);
  }

  @Post('images')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
    }),
  )
  upload(@UploadedFile() file?: { buffer: Buffer }) {
    return this.images.save(file);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  create(@Body() data: CreateMedicineDto) {
    return this.medicineService.create(data);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.PHARMACY, UserRole.USER)
  findAll() {
    return this.medicineService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY, UserRole.USER)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateMedicineDto,
  ) {
    return this.medicineService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.PHARMACY)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.medicineService.remove(id);
  }
}
