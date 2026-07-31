import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { BcryptEncryptionService } from './infrastructure/services/bcrypt-encryptation.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

@Module({
  imports: [PrismaModule],
  providers: [
    PrismaModule,
    {
      provide: PROVIDES_NAMES.EncryptionService,
      useClass: BcryptEncryptionService,
    },
  ],
  exports: [PROVIDES_NAMES.EncryptionService],
})
export class CoreModule {}
