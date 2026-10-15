import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentAcknowledgmentEntity } from '../../domain/entities/official-document-acknowledgment.entity';

@Injectable()
export class GetDocumentAcknowledgmentsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    documentId: string,
    condominiumId: string,
  ): Promise<OfficialDocumentAcknowledgmentEntity[]> {
    return this.repository.findAcknowledgments(documentId, condominiumId);
  }
}

