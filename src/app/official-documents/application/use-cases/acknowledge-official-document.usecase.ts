import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentAcknowledgmentEntity } from '../../domain/entities/official-document-acknowledgment.entity';

@Injectable()
export class AcknowledgeOfficialDocumentUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    documentId: string,
    condominiumId: string,
    userId: string,
    houseId?: string | null,
  ): Promise<OfficialDocumentAcknowledgmentEntity> {
    const document = await this.repository.findById(documentId, condominiumId);
    if (!document) {
      throw new NotFoundException('Documento oficial no encontrado');
    }

    return this.repository.recordAcknowledgment(
      documentId,
      userId,
      houseId ?? null,
    );
  }
}

