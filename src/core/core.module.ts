import { Module } from '@nestjs/common';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module';
import { BcryptEncryptionService } from './infrastructure/services/bcrypt-encryption.service';
import { ResendMailService } from './infrastructure/services/resend-mail.service';
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
  ],
  exports: [PROVIDES_NAMES.EncryptionService, PROVIDES_NAMES.MailService],
})
export class CoreModule {}
