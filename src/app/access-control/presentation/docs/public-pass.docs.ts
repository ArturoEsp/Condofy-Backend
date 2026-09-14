import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { HttpStatus } from '@nestjs/common';
import { PublicPassResponse } from '../dtos/responses/public-pass.response';

export const getPublicPass: ApiEndpointProps = {
  summary:
    'Consultar información pública de un pase de acceso para visitantes (sin requerir login)',
  status: HttpStatus.OK,
  withToken: false,
  serialization: PublicPassResponse,
  type: PublicPassResponse,
};
