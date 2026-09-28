import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { StandContactResponse } from '../dtos/responses/stand-contact.response';

export const createStandContact: ApiEndpointProps = {
  summary: 'Crear un nuevo teléfono o contacto de caseta',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: StandContactResponse,
  type: StandContactResponse,
};

export const listStandContacts: ApiEndpointProps = {
  summary: 'Listar contactos de caseta del condominio',
  status: HttpStatus.OK,
  withToken: true,
  serialization: StandContactResponse,
  type: [StandContactResponse],
};

export const updateStandContact: ApiEndpointProps = {
  summary: 'Actualizar un contacto de caseta',
  status: HttpStatus.OK,
  withToken: true,
  serialization: StandContactResponse,
  type: StandContactResponse,
};

export const deleteStandContact: ApiEndpointProps = {
  summary: 'Eliminar un contacto de caseta',
  status: HttpStatus.OK,
  withToken: true,
};
