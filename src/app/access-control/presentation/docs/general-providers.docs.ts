import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import {
  GeneralProviderListResponse,
  GeneralProviderResponse,
  RegisterGeneralProviderResultResponse,
  ExitGeneralProviderResultResponse,
} from '../dtos/responses/general-provider.response';

export const standRegisterGeneralProvider: ApiEndpointProps = {
  summary:
    'Registrar entrada de proveedor general y notificar a los residentes',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: RegisterGeneralProviderResultResponse,
  type: RegisterGeneralProviderResultResponse,
};

export const standExitGeneralProvider: ApiEndpointProps = {
  summary: 'Registrar salida de proveedor general y notificar a los residentes',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ExitGeneralProviderResultResponse,
  type: ExitGeneralProviderResultResponse,
};

export const standGetActiveGeneralProviders: ApiEndpointProps = {
  summary: 'Listar proveedores generales actualmente dentro del condominio',
  status: HttpStatus.OK,
  withToken: true,
  serialization: GeneralProviderResponse,
  type: [GeneralProviderResponse],
};

export const standGetGeneralProvidersHistory: ApiEndpointProps = {
  summary: 'Consultar historial de visitas de proveedores generales en caseta',
  status: HttpStatus.OK,
  withToken: true,
  serialization: GeneralProviderListResponse,
  type: GeneralProviderListResponse,
};

export const residentGetActiveGeneralProviders: ApiEndpointProps = {
  summary:
    'Obtener proveedores actualmente en el condominio (vista residentes)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: GeneralProviderResponse,
  type: [GeneralProviderResponse],
};
