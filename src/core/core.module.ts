import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { BcryptEncryptionService } from './infrastructure/services/bcrypt-encryption.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PROVIDES_NAMES.EncryptionService,
      useClass: BcryptEncryptionService,
    },
  ],
  exports: [PROVIDES_NAMES.EncryptionService],
})
export class CoreModule {}
