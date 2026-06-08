import { ApiEndpointProps } from '@/app/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { UserMeResponse } from '../../application/dto/responses/user-me.response';

export const authGetMe: ApiEndpointProps = {
  summary: 'Obtener información del usuario autenticado',
  status: HttpStatus.OK,
  withToken: true,
  serialization: UserMeResponse,
  type: UserMeResponse,
};
