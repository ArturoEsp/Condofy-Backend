import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import {
  AccessLogResponse,
  StandDashboardStatsResponse,
} from '../dtos/responses/access-log.response';
import { PublicPassResponse } from '../dtos/responses/public-pass.response';

export const standRegisterAccessLog: ApiEndpointProps = {
  summary: 'Registrar entrada o salida de un pase en caseta',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AccessLogResponse,
  type: AccessLogResponse,
};

export const standGetAccessLogs: ApiEndpointProps = {
  summary: 'Listar bitácora de accesos del día en caseta',
  status: HttpStatus.OK,
  withToken: true,
  type: [AccessLogResponse],
};

export const standGetStats: ApiEndpointProps = {
  summary: 'Obtener métricas rápidas de caseta para el dashboard',
  status: HttpStatus.OK,
  withToken: true,
  serialization: StandDashboardStatsResponse,
  type: StandDashboardStatsResponse,
};

export const standGetPass: ApiEndpointProps = {
  summary: 'Buscar pase de acceso por PIN, código visual o QR para caseta',
  status: HttpStatus.OK,
  withToken: true,
  serialization: PublicPassResponse,
  type: PublicPassResponse,
};
