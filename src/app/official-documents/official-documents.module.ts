import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';
import { CoreModule } from '@/core/core.module';
import { NotificationsModule } from '@/app/notifications/notifications.module';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';

import { OfficialDocumentsController } from './presentation/controllers/official-documents.controller';
import { OfficialDocumentsPrismaRepository } from './infrastructure/repositories/official-documents.prisma.repository';

import { CreateOfficialDocumentUseCase } from './application/use-cases/create-official-document.usecase';
import { GetOfficialDocumentsUseCase } from './application/use-cases/get-official-documents.usecase';
import { GetOfficialDocumentByIdUseCase } from './application/use-cases/get-official-document-by-id.usecase';
import { UpdateOfficialDocumentUseCase } from './application/use-cases/update-official-document.usecase';
import { ToggleOfficialDocumentPublishUseCase } from './application/use-cases/toggle-official-document-publish.usecase';
import { DeleteOfficialDocumentUseCase } from './application/use-cases/delete-official-document.usecase';
import { GetResidentOfficialDocumentsUseCase } from './application/use-cases/get-resident-official-documents.usecase';
import { AcknowledgeOfficialDocumentUseCase } from './application/use-cases/acknowledge-official-document.usecase';
import { RecordOfficialDocumentViewUseCase } from './application/use-cases/record-official-document-view.usecase';
import { GetDocumentAcknowledgmentsUseCase } from './application/use-cases/get-document-acknowledgments.usecase';

@Module({
  imports: [PrismaModule, CoreModule, NotificationsModule],
  controllers: [OfficialDocumentsController],
  providers: [
    {
      provide: PROVIDES_NAMES.OfficialDocumentsRepository,
      useClass: OfficialDocumentsPrismaRepository,
    },
    CreateOfficialDocumentUseCase,
    GetOfficialDocumentsUseCase,
    GetOfficialDocumentByIdUseCase,
    UpdateOfficialDocumentUseCase,
    ToggleOfficialDocumentPublishUseCase,
    DeleteOfficialDocumentUseCase,
    GetResidentOfficialDocumentsUseCase,
    AcknowledgeOfficialDocumentUseCase,
    RecordOfficialDocumentViewUseCase,
    GetDocumentAcknowledgmentsUseCase,
  ],
  exports: [
    PROVIDES_NAMES.OfficialDocumentsRepository,
    GetOfficialDocumentsUseCase,
    GetOfficialDocumentByIdUseCase,
    GetResidentOfficialDocumentsUseCase,
  ],
})
export class OfficialDocumentsModule {}

