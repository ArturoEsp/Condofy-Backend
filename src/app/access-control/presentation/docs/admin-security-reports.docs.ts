import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';

export const getSecurityReport: ApiEndpointProps = {
  summary:
    'Obtener reporte unificado de caseta (visitas, paquetería y proveedores)',
  status: HttpStatus.OK,
  withToken: true,
};

export const exportSecurityReportCsv: ApiEndpointProps = {
  summary: 'Exportar reporte de caseta a archivo CSV compatible con Excel',
  status: HttpStatus.OK,
  withToken: true,
};
