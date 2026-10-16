import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { OfficialDocumentResponse } from '../dtos/responses/official-document.response';
import { OfficialDocumentsListResponse } from '../dtos/responses/official-documents-list.response';
import { OfficialDocumentAcknowledgmentResponse } from '../dtos/responses/official-document-acknowledgment.response';

export const createDocument: ApiEndpointProps = {
  summary:
    'Crear un nuevo documento oficial con control de visibilidad y alcance',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: OfficialDocumentResponse,
  type: OfficialDocumentResponse,
};

export const getAdminDocuments: ApiEndpointProps = {
  summary: 'Listar todos los documentos oficiales del fraccionamiento (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: OfficialDocumentsListResponse,
  type: OfficialDocumentsListResponse,
};

export const getResidentDocuments: ApiEndpointProps = {
  summary: 'Listar documentos oficiales disponibles para el residente actual',
  status: HttpStatus.OK,
  withToken: true,
  type: [OfficialDocumentResponse],
};

export const getDocumentById: ApiEndpointProps = {
  summary: 'Obtener detalle de un documento oficial por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: OfficialDocumentResponse,
  type: OfficialDocumentResponse,
};

export const updateDocument: ApiEndpointProps = {
  summary: 'Actualizar datos o audiencia de un documento oficial',
  status: HttpStatus.OK,
  withToken: true,
  serialization: OfficialDocumentResponse,
  type: OfficialDocumentResponse,
};

export const togglePublishDocument: ApiEndpointProps = {
  summary: 'Publicar u ocultar un documento oficial',
  status: HttpStatus.OK,
  withToken: true,
  serialization: OfficialDocumentResponse,
  type: OfficialDocumentResponse,
};

export const deleteDocument: ApiEndpointProps = {
  summary: 'Eliminar un documento oficial',
  status: HttpStatus.OK,
  withToken: true,
};

export const recordDocumentView: ApiEndpointProps = {
  summary: 'Registrar que el residente abrió o visualizó el documento oficial',
  status: HttpStatus.OK,
  withToken: true,
};

export const acknowledgeDocument: ApiEndpointProps = {
  summary: 'Registrar acuse de recibo y aceptación de lectura del documento',
  status: HttpStatus.OK,
  withToken: true,
  serialization: OfficialDocumentAcknowledgmentResponse,
  type: OfficialDocumentAcknowledgmentResponse,
};

export const getDocumentAcknowledgments: ApiEndpointProps = {
  summary:
    'Obtener listado de residentes que han visto y aceptado el documento',
  status: HttpStatus.OK,
  withToken: true,
  type: [OfficialDocumentAcknowledgmentResponse],
};
