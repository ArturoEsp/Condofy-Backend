import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';
import { GetResidentOfficialDocumentsQuery } from '../queries/get-resident-official-documents.query';

@Injectable()
export class GetResidentOfficialDocumentsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    query: GetResidentOfficialDocumentsQuery,
  ): Promise<OfficialDocumentEntity[]> {
    return this.repository.findForResident({
      condominiumId: query.condominiumId,
      userId: query.userId,
      houseId: query.houseId,
      category: query.category,
      search: query.search,
    });
  }
}

