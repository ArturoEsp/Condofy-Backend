import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PipeTransform, Type } from '@nestjs/common';
import { CondominiumIdPipe } from '../pipes/condominium-id.pipe';

export const CondominiumIdParam = createParamDecorator(
  (paramName: string = 'condominiumKey', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const key = request.params?.[paramName];

    // Si el usuario autenticado ya resolvió el condominiumId para esta clave, reutilizarlo
    if (
      request.user?.condominiumKey &&
      request.user.condominiumKey === key &&
      request.user.condominiumId
    ) {
      return request.user.condominiumId;
    }

    return key;
  },
);

export function CondominiumId(
  paramName: string = 'condominiumKey',
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  return CondominiumIdParam(paramName, CondominiumIdPipe, ...pipes);
}
