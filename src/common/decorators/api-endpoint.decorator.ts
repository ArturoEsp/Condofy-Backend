import {
  applyDecorators,
  CanActivate,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export type ApiEndpointProps = {
  summary: string;
  status: HttpStatus;
  type?: any;
  serialization?: any;
  withToken?: boolean;
  // eslint-disable-next-line @typescript-eslint/ban-types
  guards?: (CanActivate | Function)[];
};

export function ApiEndpoint(data: ApiEndpointProps) {
  const decorators: Array<
    ClassDecorator | MethodDecorator | PropertyDecorator
  > = [];

  if (data.withToken) decorators.push(ApiBearerAuth());
  if (data.guards) decorators.push(UseGuards(...data.guards));
  if (data.serialization)
    decorators.push(SerializeOptions({ type: data.serialization }));

  return applyDecorators(
    ApiOperation({ summary: data.summary }),
    ApiResponse({
      status: data.status,
      ...(data.type && { type: data.type }),
    }),
    HttpCode(data.status),
    UseInterceptors(ClassSerializerInterceptor),
    ...decorators,
  );
}
