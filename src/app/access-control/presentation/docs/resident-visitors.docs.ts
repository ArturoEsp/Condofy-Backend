import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { VisitorResponse } from '../dtos/responses/visitor.response';
import { ListVisitorsResponse } from '../dtos/responses/list-visitors.response';

export const createVisitor: ApiEndpointProps = {
  summary: 'Registrar un nuevo visitante en la agenda de la casa del residente',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: VisitorResponse,
  type: VisitorResponse,
};

export const listVisitors: ApiEndpointProps = {
  summary:
    'Consultar la lista de visitantes registrados en la casa del residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ListVisitorsResponse,
  type: ListVisitorsResponse,
};
