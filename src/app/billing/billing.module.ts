import { Module } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { BillingPrismaRepository } from './infrastructure/repositories/billing.prisma.repository';
import { BillingController } from './presentation/controllers/billing.controller';
import { GetBillingSettingsUseCase } from './application/use-cases/get-billing-settings.usecase';
import { UpdateBillingSettingsUseCase } from './application/use-cases/update-billing-settings.usecase';
import { GetBillingRecordsUseCase } from './application/use-cases/get-billing-records.usecase';
import { RegisterPaymentUseCase } from './application/use-cases/register-payment.usecase';
import { UploadResidentProofUseCase } from './application/use-cases/upload-resident-proof.usecase';
import { ReviewResidentProofUseCase } from './application/use-cases/review-resident-proof.usecase';
import { GetMyBillingUseCase } from './application/use-cases/get-my-billing.usecase';
import { CreateExtraIncomeUseCase } from './application/use-cases/create-extra-income.usecase';
import { GetExtraIncomesUseCase } from './application/use-cases/get-extra-incomes.usecase';
import { DeleteExtraIncomeUseCase } from './application/use-cases/delete-extra-income.usecase';

import { CoreModule } from '@/core/core.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { BillingNotificationService } from './infrastructure/services/billing-notification.service';
import { BillingSchedulerService } from './infrastructure/services/billing-scheduler.service';

@Module({
  imports: [CoreModule, NotificationsModule],
  providers: [
    BillingNotificationService,
    BillingSchedulerService,
    {
      provide: PROVIDES_NAMES.BillingRepository,
      useClass: BillingPrismaRepository,
    },
    {
      provide: GetBillingSettingsUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new GetBillingSettingsUseCase(repo),
    },
    {
      provide: UpdateBillingSettingsUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new UpdateBillingSettingsUseCase(repo),
    },
    {
      provide: GetBillingRecordsUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new GetBillingRecordsUseCase(repo),
    },
    {
      provide: RegisterPaymentUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new RegisterPaymentUseCase(repo),
    },
    {
      provide: UploadResidentProofUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new UploadResidentProofUseCase(repo),
    },
    {
      provide: ReviewResidentProofUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new ReviewResidentProofUseCase(repo),
    },
    {
      provide: GetMyBillingUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new GetMyBillingUseCase(repo),
    },
    {
      provide: CreateExtraIncomeUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new CreateExtraIncomeUseCase(repo),
    },
    {
      provide: GetExtraIncomesUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new GetExtraIncomesUseCase(repo),
    },
    {
      provide: DeleteExtraIncomeUseCase,
      inject: [PROVIDES_NAMES.BillingRepository],
      useFactory: (repo) => new DeleteExtraIncomeUseCase(repo),
    },
  ],
  controllers: [BillingController],
  exports: [PROVIDES_NAMES.BillingRepository],
})
export class BillingModule {}
