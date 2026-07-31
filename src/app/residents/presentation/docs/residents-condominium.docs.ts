import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { ResidentResponse } from '../dtos/responses/resident.response';
import { ListResidentsResponse } from '../dtos/responses/list-residents.response';

export const createResident: ApiEndpointProps = {
  summary: 'Crear un nuevo residente',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: ResidentResponse,
  type: ResidentResponse,
};

export const listResidents: ApiEndpointProps = {
  summary: 'Listar residentes',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ListResidentsResponse,
  type: ListResidentsResponse,
};
