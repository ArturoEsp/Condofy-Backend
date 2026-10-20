import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { VisitorResponse } from '../dtos/responses/visitor.response';
import {
  ListVisitorsResponse,
  ListAllVisitorsResponse,
} from '../dtos/responses/list-visitors.response';

export const createVisitor: ApiEndpointProps = {
  summary: 'Registrar un nuevo visitante en la agenda de la casa del residente',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: VisitorResponse,
  type: VisitorResponse,
};

export const listAllVisitors: ApiEndpointProps = {
  summary:
    'Consultar el catálogo completo de visitantes activos de la casa sin paginación',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ListAllVisitorsResponse,
  type: ListAllVisitorsResponse,
};

export const listVisitors: ApiEndpointProps = {
  summary:
    'Consultar la lista de visitantes registrados en la casa del residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ListVisitorsResponse,
  type: ListVisitorsResponse,
};

export const updateVisitor: ApiEndpointProps = {
  summary: 'Actualizar los datos de un visitante en la agenda de la casa',
  status: HttpStatus.OK,
  withToken: true,
  serialization: VisitorResponse,
  type: VisitorResponse,
};

export const deleteVisitor: ApiEndpointProps = {
  summary:
    'Eliminar o archivar un visitante de la agenda (archivado seguro si ya cuenta con historial de accesos)',
  status: HttpStatus.OK,
  withToken: true,
};
