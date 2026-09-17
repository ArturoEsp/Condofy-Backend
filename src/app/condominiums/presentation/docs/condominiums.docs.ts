import { HttpStatus } from '@nestjs/common';
import { CondominiumResponse } from '../dtos/responses/condominium.response';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';

export const createCondominium: ApiEndpointProps = {
  summary: 'Crear un nuevo condominio',
  status: HttpStatus.CREATED,
  withToken: true,
};

export const getCondominiumByKey: ApiEndpointProps = {
  summary: 'Obtener un condominio por su clave',
  status: HttpStatus.OK,
  withToken: true,
  serialization: CondominiumResponse,
  type: CondominiumResponse,
};

export const getCondominiumDetails: ApiEndpointProps = {
  summary: 'Obtener los detalles completos del condominio',
  status: HttpStatus.OK,
  withToken: true,
};

export const updateCondominiumDetails: ApiEndpointProps = {
  summary: 'Actualizar la información del condominio',
  status: HttpStatus.OK,
  withToken: true,
};
