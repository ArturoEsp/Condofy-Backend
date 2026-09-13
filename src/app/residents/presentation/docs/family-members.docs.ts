import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { ResidentResponse } from '../dtos/responses/resident.response';

export const createFamilyMember: ApiEndpointProps = {
  summary: 'Crear un nuevo familiar o inquilino en el hogar del residente',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: ResidentResponse,
  type: ResidentResponse,
};

export const listFamilyMembers: ApiEndpointProps = {
  summary:
    'Listar familiares e inquilinos registrados en el hogar del residente',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ResidentResponse,
  type: [ResidentResponse],
};

export const updateFamilyMember: ApiEndpointProps = {
  summary: 'Actualizar datos de un familiar o inquilino del hogar',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ResidentResponse,
  type: ResidentResponse,
};

export const toggleFamilyMemberStatus: ApiEndpointProps = {
  summary: 'Activar o desactivar cuenta de un familiar o inquilino',
  status: HttpStatus.OK,
  withToken: true,
};
