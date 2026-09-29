import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { CoreModule } from '@/core/core.module';
import { NotificationsModule } from '@/app/notifications/notifications.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { AnnouncementsController } from './presentation/controllers/announcements.controller';
import { AnnouncementsPrismaRepository } from './infrastructure/repositories/announcements.prisma.repository';

import { CreateAnnouncementUseCase } from './application/use-cases/create-announcement.usecase';
import { GetAnnouncementsUseCase } from './application/use-cases/get-announcements.usecase';
import { GetAnnouncementByIdUseCase } from './application/use-cases/get-announcement-by-id.usecase';
import { UpdateAnnouncementUseCase } from './application/use-cases/update-announcement.usecase';
import { ToggleAnnouncementActiveUseCase } from './application/use-cases/toggle-announcement-active.usecase';
import { DeleteAnnouncementUseCase } from './application/use-cases/delete-announcement.usecase';
import { RecordAnnouncementReadUseCase } from './application/use-cases/record-announcement-read.usecase';

@Module({
  imports: [PrismaModule, CoreModule, NotificationsModule],
  controllers: [AnnouncementsController],
  providers: [
    {
      provide: PROVIDES_NAMES.AnnouncementsRepository,
      useClass: AnnouncementsPrismaRepository,
    },
    CreateAnnouncementUseCase,
    GetAnnouncementsUseCase,
    GetAnnouncementByIdUseCase,
    UpdateAnnouncementUseCase,
    ToggleAnnouncementActiveUseCase,
    DeleteAnnouncementUseCase,
    RecordAnnouncementReadUseCase,
  ],
  exports: [
    PROVIDES_NAMES.AnnouncementsRepository,
    GetAnnouncementsUseCase,
    GetAnnouncementByIdUseCase,
  ],
})
export class AnnouncementsModule {}
