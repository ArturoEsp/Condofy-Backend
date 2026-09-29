import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { AnnouncementResponse } from '../dtos/responses/announcement.response';

export const createAnnouncement: ApiEndpointProps = {
  summary: 'Crear un nuevo comunicado con hasta 3 fotos y 1 archivo adicional',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AnnouncementResponse,
  type: AnnouncementResponse,
};

export const getAnnouncements: ApiEndpointProps = {
  summary:
    'Listar comunicados y alertas del condominio (con filtros por estado)',
  status: HttpStatus.OK,
  withToken: true,
  type: [AnnouncementResponse],
};

export const getAnnouncementById: ApiEndpointProps = {
  summary: 'Obtener detalle completo de un comunicado por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AnnouncementResponse,
  type: AnnouncementResponse,
};

export const updateAnnouncement: ApiEndpointProps = {
  summary: 'Actualizar un comunicado y gestionar sus fotos/archivos adjuntos',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AnnouncementResponse,
  type: AnnouncementResponse,
};

export const toggleAnnouncementActive: ApiEndpointProps = {
  summary: 'Pausar o reanudar publicación de un comunicado',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AnnouncementResponse,
  type: AnnouncementResponse,
};

export const deleteAnnouncement: ApiEndpointProps = {
  summary: 'Eliminar un comunicado y sus adjuntos',
  status: HttpStatus.OK,
  withToken: true,
};

export const recordAnnouncementRead: ApiEndpointProps = {
  summary: 'Registrar lectura de comunicado por el usuario actual',
  status: HttpStatus.OK,
  withToken: true,
};
