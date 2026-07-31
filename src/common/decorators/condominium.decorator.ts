import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PipeTransform, Type } from '@nestjs/common';
import { CondominiumIdPipe } from '../pipes/condominium-id.pipe';

export const CondominiumIdParam = createParamDecorator(
  (paramName: string = 'condominiumKey', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.params[paramName];
  },
);

export function CondominiumId(
  paramName: string = 'condominiumKey',
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return CondominiumIdParam(paramName, CondominiumIdPipe, ...pipes);
}
