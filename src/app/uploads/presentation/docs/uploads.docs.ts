import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { UploadFileResponse } from '../dtos/responses/upload-file.response';

export const uploadFileDoc: ApiEndpointProps = {
  summary:
    'Subir un archivo al almacenamiento multitenant (S3 / Cloudflare R2)',
  status: HttpStatus.CREATED,
  withToken: true,
  type: UploadFileResponse,
};

export const getPresignedUrlDoc: ApiEndpointProps = {
  summary: 'Generar URL firmada temporal para acceder a un archivo privado',
  status: HttpStatus.OK,
  withToken: true,
};

export const deleteFileDoc: ApiEndpointProps = {
  summary: 'Eliminar un archivo del almacenamiento',
  status: HttpStatus.OK,
  withToken: true,
};
