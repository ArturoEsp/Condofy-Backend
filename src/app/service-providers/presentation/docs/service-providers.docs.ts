import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { ServiceProviderResponse } from '../dtos/responses/service-provider.response';
import { ServiceProvidersListResponse } from '../dtos/responses/service-providers-list.response';
import { ToggleLikeResponse } from '../dtos/responses/toggle-like.response';

export const createProvider: ApiEndpointProps = {
  summary: 'Registrar un nuevo proveedor de servicios u oficial (Solo Admin)',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: ServiceProviderResponse,
  type: ServiceProviderResponse,
};

export const getProviders: ApiEndpointProps = {
  summary:
    'Listar proveedores con filtros, búsqueda, ordenamiento y estado de like',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ServiceProvidersListResponse,
  type: ServiceProvidersListResponse,
};

export const getProviderById: ApiEndpointProps = {
  summary: 'Obtener detalle completo de un proveedor por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ServiceProviderResponse,
  type: ServiceProviderResponse,
};

export const updateProvider: ApiEndpointProps = {
  summary: 'Actualizar información de un proveedor (Solo Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ServiceProviderResponse,
  type: ServiceProviderResponse,
};

export const deleteProvider: ApiEndpointProps = {
  summary: 'Eliminar un proveedor del directorio (Solo Admin)',
  status: HttpStatus.NO_CONTENT,
  withToken: true,
};

export const toggleLike: ApiEndpointProps = {
  summary:
    'Dar o quitar me gusta / recomendación a un proveedor (Residentes y Admins)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ToggleLikeResponse,
  type: ToggleLikeResponse,
};
