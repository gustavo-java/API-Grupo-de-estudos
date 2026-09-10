import { ProductImportService } from './application/services/product-import.service';
import { Module } from '@nestjs/common';
import { ProductImageService } from './infrastructure/storage/product-image.service';
import { APP_GUARD } from '@nestjs/core';
import { AppService } from './application/services/app.service';
import { AuthService } from './application/services/auth.service';
import { MedicineService } from './application/services/medicine.service';
import { PrescriptionService } from './application/services/prescription.service';
import { UserService } from './application/services/user.service';
import { PASSWORD_HASHER, TOKEN_SERVICE } from './domain/auth/security.ports';
import { MEDICINE_REPOSITORY } from './domain/repositories/medicine.repository';
import { PRESCRIPTION_REPOSITORY } from './domain/repositories/prescription.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { PrismaMedicineRepository } from './infrastructure/database/prisma/repositories/prisma-medicine.repository';
import { PrismaPrescriptionRepository } from './infrastructure/database/prisma/repositories/prisma-prescription.repository';
import { PrismaUserRepository } from './infrastructure/database/prisma/repositories/prisma-user.repository';
import { HmacTokenService } from './infrastructure/security/hmac-token.service';
import { ScryptPasswordHasher } from './infrastructure/security/scrypt-password-hasher';
import { AuthGuard } from './presentation/auth/auth.guard';
import { RolesGuard } from './presentation/auth/roles.guard';
import { AppController } from './presentation/controllers/app.controller';
import { AuthController } from './presentation/controllers/auth.controller';
import { MedicineController } from './presentation/controllers/medicine.controller';
import { PrescriptionController } from './presentation/controllers/prescription.controller';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    AppController,
    AuthController,
    UserController,
    MedicineController,
    PrescriptionController,
  ],
  providers: [
    ProductImportService,
    ProductImageService,
    AppService,
    AuthService,
    UserService,
    MedicineService,
    PrescriptionService,
    { provide: USER_REPOSITORY, useClass: PrismaUserRepository },
    { provide: MEDICINE_REPOSITORY, useClass: PrismaMedicineRepository },
    {
      provide: PRESCRIPTION_REPOSITORY,
      useClass: PrismaPrescriptionRepository,
    },
    { provide: PASSWORD_HASHER, useClass: ScryptPasswordHasher },
    { provide: TOKEN_SERVICE, useClass: HmacTokenService },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
