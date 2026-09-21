import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { BcryptEncryptionService } from './infrastructure/services/bcrypt-encryption.service';
import { ResendMailService } from './infrastructure/services/resend-mail.service';
import { S3StorageService } from './infrastructure/services/s3-storage.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PROVIDES_NAMES.EncryptionService,
      useClass: BcryptEncryptionService,
    },
    {
      provide: PROVIDES_NAMES.MailService,
      useClass: ResendMailService,
    },
    {
      provide: PROVIDES_NAMES.StorageService,
      useClass: S3StorageService,
    },
  ],
  exports: [
    PROVIDES_NAMES.EncryptionService,
    PROVIDES_NAMES.MailService,
    PROVIDES_NAMES.StorageService,
  ],
})
export class CoreModule {}
