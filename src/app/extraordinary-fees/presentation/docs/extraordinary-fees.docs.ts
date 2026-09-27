import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import {
  ExtraordinaryFeeChargeResponse,
  ExtraordinaryFeeResponse,
} from '../dtos/responses/extraordinary-fee.responses';

export const createFee: ApiEndpointProps = {
  summary: 'Crear nueva cuota extraordinaria con justificación y cotizaciones',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: ExtraordinaryFeeResponse,
  type: ExtraordinaryFeeResponse,
};

export const getFees: ApiEndpointProps = {
  summary: 'Listar cuotas extraordinarias del condominio con avance y KPIs',
  status: HttpStatus.OK,
  withToken: true,
};

export const getFeeById: ApiEndpointProps = {
  summary:
    'Obtener detalle de una cuota extraordinaria con cotizaciones y desglose de viviendas',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExtraordinaryFeeResponse,
  type: ExtraordinaryFeeResponse,
};

export const updateFeeStatus: ApiEndpointProps = {
  summary:
    'Actualizar estatus de una cuota extraordinaria (ACTIVE, COMPLETED, CANCELLED)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExtraordinaryFeeResponse,
  type: ExtraordinaryFeeResponse,
};

export const deleteFee: ApiEndpointProps = {
  summary: 'Eliminar cuota extraordinaria y sus documentos asociados',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExtraordinaryFeeResponse,
  type: ExtraordinaryFeeResponse,
};

export const registerPayment: ApiEndpointProps = {
  summary: 'Registrar pago manual de cuota extraordinaria por administración',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: ExtraordinaryFeeChargeResponse,
  type: ExtraordinaryFeeChargeResponse,
};

export const uploadResidentProof: ApiEndpointProps = {
  summary: 'Subir comprobante de pago de cuota extraordinaria por el residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExtraordinaryFeeChargeResponse,
  type: ExtraordinaryFeeChargeResponse,
};

export const reviewResidentProof: ApiEndpointProps = {
  summary:
    'Aprobar o rechazar comprobante de cuota extraordinaria del residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExtraordinaryFeeChargeResponse,
  type: ExtraordinaryFeeChargeResponse,
};

export const getMyCharges: ApiEndpointProps = {
  summary:
    'Listar cuotas extraordinarias asignadas a la vivienda del residente autenticado',
  status: HttpStatus.OK,
  withToken: true,
};
