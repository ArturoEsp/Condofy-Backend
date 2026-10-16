import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';

@Injectable()
export class RecordOfficialDocumentViewUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    documentId: string,
    condominiumId: string,
    userId: string,
    houseId?: string | null,
  ): Promise<void> {
    const document = await this.repository.findById(documentId, condominiumId);
    if (!document) {
      return;
    }

    await this.repository.recordView(documentId, userId, houseId ?? null);
  }
}

