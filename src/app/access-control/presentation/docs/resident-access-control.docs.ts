import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { AccessAuthorizationResponse } from '../dtos/responses/access-authorization.response';
import { ListAccessAuthorizationsResponse } from '../dtos/responses/list-access-authorizations.response';

export const createAccessAuthorization: ApiEndpointProps = {
  summary: 'Crear un pase o control de acceso para un visitante',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AccessAuthorizationResponse,
  type: AccessAuthorizationResponse,
};

export const listAccessAuthorizations: ApiEndpointProps = {
  summary: 'Consultar la lista de accesos de la casa del residente autenticado',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ListAccessAuthorizationsResponse,
  type: ListAccessAuthorizationsResponse,
};

export const updateAccessAuthorization: ApiEndpointProps = {
  summary: 'Actualizar o revocar una autorización de acceso',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AccessAuthorizationResponse,
  type: AccessAuthorizationResponse,
};

export const revokeAccessAuthorization: ApiEndpointProps = {
  summary: 'Revocar (cancelar) directamente un pase de acceso',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AccessAuthorizationResponse,
  type: AccessAuthorizationResponse,
};
