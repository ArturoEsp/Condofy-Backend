import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { GuardResponse } from '../dtos/responses/guard.response';

export const createGuard: ApiEndpointProps = {
  summary: 'Crear usuario de guardia de seguridad para el condominio',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: GuardResponse,
  type: GuardResponse,
};

export const listGuards: ApiEndpointProps = {
  summary: 'Listar usuarios de guardia de seguridad del condominio',
  status: HttpStatus.OK,
  withToken: true,
  type: [GuardResponse],
};

export const updateGuardStatus: ApiEndpointProps = {
  summary: 'Actualizar estado de un guardia de seguridad',
  status: HttpStatus.OK,
  withToken: true,
  serialization: GuardResponse,
  type: GuardResponse,
};

export const deleteGuard: ApiEndpointProps = {
  summary: 'Eliminar un guardia de seguridad',
  status: HttpStatus.OK,
  withToken: true,
};
