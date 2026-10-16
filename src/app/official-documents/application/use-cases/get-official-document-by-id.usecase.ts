import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { OfficialDocumentsRepository } from '../../domain/repositories/official-documents.repository';
import { OfficialDocumentEntity } from '../../domain/entities/official-document.entity';

@Injectable()
export class GetOfficialDocumentByIdUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.OfficialDocumentsRepository)
    private readonly repository: OfficialDocumentsRepository,
  ) {}

  async execute(
    id: string,
    condominiumId: string,
    userId?: string,
    userRole?: string,
  ): Promise<OfficialDocumentEntity> {
    const document = await this.repository.findById(id, condominiumId, userId);
    if (!document) {
      throw new NotFoundException('El documento oficial no fue encontrado');
    }

    if (userRole === 'RESIDENT') {
      if (!document.isPublished || document.targetScope === 'PRIVATE') {
        throw new ForbiddenException(
          'No tienes permisos para visualizar este documento',
        );
      }
    }

    return document;
  }
}
