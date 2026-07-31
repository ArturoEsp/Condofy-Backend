import { HttpStatus } from '@nestjs/common';

import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HouseResponse } from '../dtos/responses/house.response';
import { ListHousesResponse } from '../dtos/responses/list-houses.response';

export const createHouse: ApiEndpointProps = {
  summary: 'Crear una nueva casa',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: HouseResponse,
  type: HouseResponse,
};

export const getHouses: ApiEndpointProps = {
  summary: 'Lista de casas',
  status: HttpStatus.OK,
  withToken: true,
  serialization: ListHousesResponse,
  type: ListHousesResponse,
};
