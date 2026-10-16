import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';

@Injectable()
export class ToggleOfficialDocumentPublishUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    isPublished: boolean,
  ): Promise<OfficialDocumentEntity> {
    return this.repository.togglePublish(id, condominiumId, isPublished);
  }
}

