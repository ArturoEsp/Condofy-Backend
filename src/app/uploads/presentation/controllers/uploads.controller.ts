import 'multer';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import {
  UploadFileRequest,
  UploadModule,
} from '../dtos/requests/upload-file.request';
import { UploadFileResponse } from '../dtos/responses/upload-file.response';
import * as Docs from '../docs/uploads.docs';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

@ApiTags('Uploads')
@Controller(':condominiumKey/uploads')
export class UploadsController {
  constructor(
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'module'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo a subir (imagen o documento de hasta 20 MB)',
        },
        module: {
          type: 'string',
          enum: Object.values(UploadModule),
          description: 'Módulo destino para organizar el almacenamiento',
        },
        referenceId: {
          type: 'string',
          description:
            'ID opcional del recurso asociado (visita, paquete, etc.)',
        },
        isPublic: {
          type: 'boolean',
          description:
            'Indica si el archivo debe ser público (por defecto falso excepto branding)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiEndpoint(Docs.uploadFileDoc)
  async uploadFile(
    @CondominiumId() condominiumId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileRequest,
  ): Promise<UploadFileResponse> {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido (${file.mimetype}). Se admiten imágenes (JPEG, PNG, WebP) y documentos (PDF, Office).`,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        'El archivo supera el límite máximo permitido de 20 MB',
      );
    }

    const isPublic =
      dto.isPublic !== undefined
        ? dto.isPublic
        : dto.module === UploadModule.BRANDING;

    const path = this.storageService.buildStoragePath({
      condominiumId,
      module: dto.module,
      fileName: file.originalname,
      referenceId: dto.referenceId,
    });

    const result = await this.storageService.uploadFile({
      file: {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
      },
      path,
      isPublic,
      contentType: file.mimetype,
    });

    return {
      key: result.key,
      url: result.url,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  @Get('presigned-url')
  @ApiEndpoint(Docs.getPresignedUrlDoc)
  async getPresignedUrl(
    @CondominiumId() condominiumId: string,
    @Query('key') key: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<{ url: string }> {
    if (!key) {
      throw new BadRequestException('El parámetro "key" es requerido');
    }

    const expectedTenantPrefix = `condominiums/${condominiumId}/`;
    if (!key.startsWith(expectedTenantPrefix)) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a archivos que no pertenecen a este condominio',
      );
    }

    const seconds = expiresIn ? parseInt(expiresIn, 10) : 900;
    const url = await this.storageService.getPresignedUrl(key, seconds);

    return { url };
  }

  @Delete()
  @ApiEndpoint(Docs.deleteFileDoc)
  async deleteFile(
    @CondominiumId() condominiumId: string,
    @Query('key') key: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!key) {
      throw new BadRequestException('El parámetro "key" es requerido');
    }

    const expectedTenantPrefix = `condominiums/${condominiumId}/`;
    if (!key.startsWith(expectedTenantPrefix)) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar archivos que no pertenecen a este condominio',
      );
    }

    await this.storageService.deleteFile(key);

    return {
      success: true,
      message: 'Archivo eliminado correctamente',
    };
  }
}
