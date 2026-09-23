import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { BillingSettingsResponse } from '../dtos/responses/billing-settings.response';
import { BillingRecordsResponse } from '../dtos/responses/billing-records.response';
import { BillingRecordResponse } from '../dtos/responses/billing-record.response';
import { MyBillingResponse } from '../dtos/responses/my-billing.response';

export const getSettings: ApiEndpointProps = {
  summary: 'Obtener configuración de cobranza del condominio',
  status: HttpStatus.OK,
  withToken: true,
  serialization: BillingSettingsResponse,
  type: BillingSettingsResponse,
};

export const updateSettings: ApiEndpointProps = {
  summary: 'Actualizar configuración de cobranza del condominio',
  status: HttpStatus.OK,
  withToken: true,
  serialization: BillingSettingsResponse,
  type: BillingSettingsResponse,
};

export const getRecords: ApiEndpointProps = {
  summary: 'Obtener registros de cobranza por periodo con KPIs y filtros',
  status: HttpStatus.OK,
  withToken: true,
  serialization: BillingRecordsResponse,
  type: BillingRecordsResponse,
};

export const registerPayment: ApiEndpointProps = {
  summary: 'Registrar pago de cuota con comprobante o recibo digital',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: BillingRecordResponse,
  type: BillingRecordResponse,
};

export const uploadResidentProof: ApiEndpointProps = {
  summary: 'Subir comprobante de pago por el residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: BillingRecordResponse,
  type: BillingRecordResponse,
};

export const reviewResidentProof: ApiEndpointProps = {
  summary: 'Aprobar o rechazar comprobante de pago de residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: BillingRecordResponse,
  type: BillingRecordResponse,
};

export const getMyBilling: ApiEndpointProps = {
  summary: 'Obtener adeudos e historial de recibos de la casa del residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: MyBillingResponse,
  type: MyBillingResponse,
};

export const exportBilling: ApiEndpointProps = {
  summary: 'Exportar balance de cobranza del periodo en formato CSV (Excel)',
  status: HttpStatus.OK,
  withToken: true,
};

export const remindPending: ApiEndpointProps = {
  summary: 'Enviar recordatorio manual a viviendas con adeudo pendiente',
  status: HttpStatus.OK,
  withToken: true,
};
