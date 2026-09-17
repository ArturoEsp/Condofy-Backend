import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import {
  AccessLogResponse,
  StandDashboardStatsResponse,
} from '../dtos/responses/access-log.response';
import { PublicPassResponse } from '../dtos/responses/public-pass.response';
import { ActiveEntryResponse } from '../dtos/responses/active-entry.response';
import { BatchExitResponse } from '../dtos/responses/batch-exit.response';

export const standRegisterAccessLog: ApiEndpointProps = {
  summary: 'Registrar entrada o salida de un pase en caseta',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AccessLogResponse,
  type: AccessLogResponse,
};

export const standGetActiveEntries: ApiEndpointProps = {
  summary: 'Listar visitas actualmente dentro del condominio en estado ENTRADA',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ActiveEntryResponse,
  type: [ActiveEntryResponse],
};

export const standBatchExit: ApiEndpointProps = {
  summary:
    'Registrar salida rápida o masiva para visitas seleccionadas en ENTRADA',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: BatchExitResponse,
  type: BatchExitResponse,
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

export const standRegisterParcel: ApiEndpointProps = {
  summary: 'Registrar recepción de paquete en caseta',
  status: HttpStatus.CREATED,
  withToken: true,
};

export const standGetParcels: ApiEndpointProps = {
  summary: 'Listar paquetes en caseta (en custodia y entregados)',
  status: HttpStatus.OK,
  withToken: true,
};

export const standGetParcelStats: ApiEndpointProps = {
  summary: 'Obtener métricas de paquetería en caseta',
  status: HttpStatus.OK,
  withToken: true,
};

export const standDeliverParcel: ApiEndpointProps = {
  summary: 'Entregar paquete mediante validación de PIN',
  status: HttpStatus.OK,
  withToken: true,
};

export const standNotifyParcel: ApiEndpointProps = {
  summary: 'Marcar paquete como notificado y generar enlace de WhatsApp',
  status: HttpStatus.OK,
  withToken: true,
};
