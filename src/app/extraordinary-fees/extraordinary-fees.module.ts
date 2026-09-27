import { Module } from '@nestjs/common';
import { CoreModule } from '@/core/core.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { ExtraordinaryFeePrismaRepository } from './infrastructure/repositories/extraordinary-fee.prisma.repository';
import { ExtraordinaryFeesController } from './presentation/controllers/extraordinary-fees.controller';

import { CreateExtraordinaryFeeUseCase } from './application/use-cases/create-extraordinary-fee.usecase';
import { GetExtraordinaryFeesUseCase } from './application/use-cases/get-extraordinary-fees.usecase';
import { GetExtraordinaryFeeByIdUseCase } from './application/use-cases/get-extraordinary-fee-by-id.usecase';
import {
  DeleteExtraordinaryFeeUseCase,
  GetMyExtraordinaryFeeChargesUseCase,
  RegisterExtraordinaryFeePaymentUseCase,
  ReviewExtraordinaryFeeProofUseCase,
  UpdateExtraordinaryFeeStatusUseCase,
  UploadExtraordinaryFeeProofUseCase,
} from './application/use-cases/extraordinary-fee-operations.usecase';

@Module({
  imports: [CoreModule],
  controllers: [ExtraordinaryFeesController],
  providers: [
    {
      provide: PROVIDES_NAMES.ExtraordinaryFeesRepository,
      useClass: ExtraordinaryFeePrismaRepository,
    },
    {
      provide: CreateExtraordinaryFeeUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new CreateExtraordinaryFeeUseCase(repo),
    },
    {
      provide: GetExtraordinaryFeesUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new GetExtraordinaryFeesUseCase(repo),
    },
    {
      provide: GetExtraordinaryFeeByIdUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new GetExtraordinaryFeeByIdUseCase(repo),
    },
    {
      provide: UpdateExtraordinaryFeeStatusUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new UpdateExtraordinaryFeeStatusUseCase(repo),
    },
    {
      provide: DeleteExtraordinaryFeeUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new DeleteExtraordinaryFeeUseCase(repo),
    },
    {
      provide: RegisterExtraordinaryFeePaymentUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new RegisterExtraordinaryFeePaymentUseCase(repo),
    },
    {
      provide: UploadExtraordinaryFeeProofUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new UploadExtraordinaryFeeProofUseCase(repo),
    },
    {
      provide: ReviewExtraordinaryFeeProofUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new ReviewExtraordinaryFeeProofUseCase(repo),
    },
    {
      provide: GetMyExtraordinaryFeeChargesUseCase,
      inject: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
      useFactory: (repo) => new GetMyExtraordinaryFeeChargesUseCase(repo),
    },
  ],
  exports: [PROVIDES_NAMES.ExtraordinaryFeesRepository],
})
export class ExtraordinaryFeesModule {}
