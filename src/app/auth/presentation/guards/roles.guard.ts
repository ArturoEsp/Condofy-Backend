import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { IS_PUBLIC_KEY } from '@/common/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Verificar primero si el endpoint es público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si es público, el RolesGuard se salta por completo 👍
    if (isPublic) {
      return true;
    }

    // 2. Obtener los roles requeridos para este endpoint
    const requeridosRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no es público pero tampoco exige roles específicos, dejamos pasar (solo requiere estar autenticado por JWT)
    if (!requeridosRoles) {
      return true;
    }

    // 3. Validar el usuario de la petición
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a este recurso.',
      );
    }

    const tieneRol = requeridosRoles.includes(user.role);
    if (!tieneRol) {
      throw new ForbiddenException('Tu rol no tiene los permisos suficientes.');
    }

    return true;
  }
}
