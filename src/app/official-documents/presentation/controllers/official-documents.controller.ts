import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/official-documents.docs';

import { CreateOfficialDocumentUseCase } from '../../application/use-cases/create-official-document.usecase';
import { GetOfficialDocumentsUseCase } from '../../application/use-cases/get-official-documents.usecase';
import { GetOfficialDocumentByIdUseCase } from '../../application/use-cases/get-official-document-by-id.usecase';
import { UpdateOfficialDocumentUseCase } from '../../application/use-cases/update-official-document.usecase';
import { ToggleOfficialDocumentPublishUseCase } from '../../application/use-cases/toggle-official-document-publish.usecase';
import { DeleteOfficialDocumentUseCase } from '../../application/use-cases/delete-official-document.usecase';
import { GetResidentOfficialDocumentsUseCase } from '../../application/use-cases/get-resident-official-documents.usecase';
import { AcknowledgeOfficialDocumentUseCase } from '../../application/use-cases/acknowledge-official-document.usecase';
import { RecordOfficialDocumentViewUseCase } from '../../application/use-cases/record-official-document-view.usecase';
import { GetDocumentAcknowledgmentsUseCase } from '../../application/use-cases/get-document-acknowledgments.usecase';

import { CreateOfficialDocumentRequest } from '../dtos/requests/create-official-document.request';
import { UpdateOfficialDocumentRequest } from '../dtos/requests/update-official-document.request';
import { ParamsListOfficialDocumentsRequest } from '../dtos/requests/params-list-official-documents.request';
import { OfficialDocumentResponse } from '../dtos/responses/official-document.response';
import { OfficialDocumentsListResponse } from '../dtos/responses/official-documents-list.response';
import { OfficialDocumentAcknowledgmentResponse } from '../dtos/responses/official-document-acknowledgment.response';

@ApiTags('Official Documents')
@Controller(':condominiumKey/official-documents')
export class OfficialDocumentsController {
  constructor(
    private readonly createDocumentUseCase: CreateOfficialDocumentUseCase,
    private readonly getDocumentsUseCase: GetOfficialDocumentsUseCase,
    private readonly getDocumentByIdUseCase: GetOfficialDocumentByIdUseCase,
    private readonly updateDocumentUseCase: UpdateOfficialDocumentUseCase,
    private readonly togglePublishUseCase: ToggleOfficialDocumentPublishUseCase,
    private readonly deleteDocumentUseCase: DeleteOfficialDocumentUseCase,
    private readonly getResidentDocumentsUseCase: GetResidentOfficialDocumentsUseCase,
    private readonly acknowledgeDocumentUseCase: AcknowledgeOfficialDocumentUseCase,
    private readonly recordViewUseCase: RecordOfficialDocumentViewUseCase,
    private readonly getAcknowledgmentsUseCase: GetDocumentAcknowledgmentsUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.createDocument)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: CreateOfficialDocumentRequest,
  ): Promise<OfficialDocumentResponse> {
    const document = await this.createDocumentUseCase.execute({
      condominiumId,
      title: body.title,
      description: body.description,
      category: body.category ?? 'REGLAMENTO',
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      version: body.version,
      isPublished: body.isPublished ?? true,
      requiresAcknowledgment: body.requiresAcknowledgment ?? false,
      targetScope: body.targetScope ?? 'ALL',
      assignedHouseIds: body.assignedHouseIds,
      createdById: user.id,
      notifyResidents: body.notifyResidents ?? false,
    });

    return OfficialDocumentResponse.fromEntity(document);
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getAdminDocuments)
  async findAll(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListOfficialDocumentsRequest,
  ): Promise<OfficialDocumentsListResponse> {
    const result = await this.getDocumentsUseCase.execute({
      condominiumId,
      category: params.category,
      isPublished: params.isPublished,
      search: params.search,
      page: params.page,
      limit: params.limit,
    });

    return {
      documents: result.documents.map((doc) =>
        OfficialDocumentResponse.fromEntity(doc),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('my-documents')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.getResidentDocuments)
  async findMyDocuments(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() params: ParamsListOfficialDocumentsRequest,
  ): Promise<OfficialDocumentResponse[]> {
    const documents = await this.getResidentDocumentsUseCase.execute({
      condominiumId,
      userId: user.id,
      category: params.category,
      search: params.search,
    });

    return documents.map((doc) => OfficialDocumentResponse.fromEntity(doc));
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN', 'RESIDENT')
  @ApiEndpoint(docs.getDocumentById)
  async findById(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<OfficialDocumentResponse> {
    const document = await this.getDocumentByIdUseCase.execute(
      id,
      condominiumId,
      user.id,
      user.role,
    );

    return OfficialDocumentResponse.fromEntity(document);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.updateDocument)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() body: UpdateOfficialDocumentRequest,
  ): Promise<OfficialDocumentResponse> {
    const updated = await this.updateDocumentUseCase.execute({
      id,
      condominiumId,
      title: body.title,
      description: body.description,
      category: body.category,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      mimeType: body.mimeType,
      version: body.version,
      isPublished: body.isPublished,
      requiresAcknowledgment: body.requiresAcknowledgment,
      targetScope: body.targetScope,
      assignedHouseIds: body.assignedHouseIds,
      notifyResidents: body.notifyResidents,
    });

    return OfficialDocumentResponse.fromEntity(updated);
  }

  @Patch(':id/toggle-publish')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.togglePublishDocument)
  async togglePublish(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
  ): Promise<OfficialDocumentResponse> {
    const updated = await this.togglePublishUseCase.execute(
      id,
      condominiumId,
      isPublished,
    );

    return OfficialDocumentResponse.fromEntity(updated);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.deleteDocument)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    await this.deleteDocumentUseCase.execute(id, condominiumId);
    return { message: 'Documento oficial eliminado exitosamente' };
  }

  @Post(':id/view')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.recordDocumentView)
  async recordView(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    await this.recordViewUseCase.execute(id, condominiumId, user.id);
    return { success: true };
  }

  @Post(':id/acknowledge')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.acknowledgeDocument)
  async acknowledge(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') id: string,
  ): Promise<OfficialDocumentAcknowledgmentResponse> {
    const ack = await this.acknowledgeDocumentUseCase.execute(
      id,
      condominiumId,
      user.id,
    );

    return OfficialDocumentAcknowledgmentResponse.fromEntity(ack);
  }

  @Get(':id/acknowledgments')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getDocumentAcknowledgments)
  async getAcknowledgments(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<OfficialDocumentAcknowledgmentResponse[]> {
    const list = await this.getAcknowledgmentsUseCase.execute(
      id,
      condominiumId,
    );

    return list.map((ack) =>
      OfficialDocumentAcknowledgmentResponse.fromEntity(ack),
    );
  }
}

