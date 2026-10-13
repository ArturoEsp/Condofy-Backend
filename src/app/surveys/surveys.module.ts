import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { CoreModule } from '@/core/core.module';
import { NotificationsModule } from '@/app/notifications/notifications.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { SurveysController } from './presentation/controllers/surveys.controller';
import { SurveysPrismaRepository } from './infrastructure/repositories/surveys.prisma.repository';

import { CreateSurveyUseCase } from './application/use-cases/create-survey.usecase';
import { GetSurveysUseCase } from './application/use-cases/get-surveys.usecase';
import { GetSurveyByIdUseCase } from './application/use-cases/get-survey-by-id.usecase';
import { UpdateSurveyUseCase } from './application/use-cases/update-survey.usecase';
import { ChangeSurveyStatusUseCase } from './application/use-cases/change-survey-status.usecase';
import { ArchiveSurveyUseCase } from './application/use-cases/archive-survey.usecase';
import { DeleteSurveyUseCase } from './application/use-cases/delete-survey.usecase';
import { SubmitSurveyVoteUseCase } from './application/use-cases/submit-survey-vote.usecase';
import { GetSurveyResultsUseCase } from './application/use-cases/get-survey-results.usecase';
import { GetResidentSurveysUseCase } from './application/use-cases/get-resident-surveys.usecase';
import { GetResidentSurveyStatusUseCase } from './application/use-cases/get-resident-survey-status.usecase';
import { SendSurveyReminderUseCase } from './application/use-cases/send-survey-reminder.usecase';

@Module({
  imports: [PrismaModule, CoreModule, NotificationsModule],
  controllers: [SurveysController],
  providers: [
    {
      provide: PROVIDES_NAMES.SurveysRepository,
      useClass: SurveysPrismaRepository,
    },
    CreateSurveyUseCase,
    GetSurveysUseCase,
    GetSurveyByIdUseCase,
    UpdateSurveyUseCase,
    ChangeSurveyStatusUseCase,
    ArchiveSurveyUseCase,
    DeleteSurveyUseCase,
    SubmitSurveyVoteUseCase,
    GetSurveyResultsUseCase,
    GetResidentSurveysUseCase,
    GetResidentSurveyStatusUseCase,
    SendSurveyReminderUseCase,
  ],
  exports: [
    PROVIDES_NAMES.SurveysRepository,
    GetSurveysUseCase,
    GetSurveyByIdUseCase,
    GetSurveyResultsUseCase,
  ],
})
export class SurveysModule {}

