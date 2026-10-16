import { Inject, Injectable } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';
import { GetOfficialDocumentsQuery } from '../queries/get-official-documents.query';

@Injectable()
export class GetOfficialDocumentsUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    query: GetOfficialDocumentsQuery,
  ): Promise<{ documents: OfficialDocumentEntity[]; total: number; page: number; limit: number }> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 20;
    const skip = (page - 1) * limit;

    const { documents, total } = await this.repository.findAll({
      condominiumId: query.condominiumId,
      category: query.category,
      isPublished: query.isPublished,
      search: query.search,
      skip,
      take: limit,
    });

    return {
      documents,
      total,
      page,
      limit,
    };
  }
}

