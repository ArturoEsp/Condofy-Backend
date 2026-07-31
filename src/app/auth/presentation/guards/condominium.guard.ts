import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CondominiumGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Inyectado previa/ por tu JwtAuthGuard

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado.');
    }

    // 1. Obtener la clave desde los parámetros de la URL
    const paramKey = request.params.condominiumKey;

    if (!paramKey) {
      return true; // O lanza error si la ruta DEBE incluir el parámetro obligatoriamente
    }

    // 2. Validación rápida contra el JWT
    const tokenKey = user.condominiumKey;

    // Si tu token garantiza acceso único a ese condominio:
    if (tokenKey && tokenKey === paramKey) {
      return true;
    }

    // 3. Validación avanzada / Fallback en BD (opcional)
    // Si la sesión o el token no coinciden, o necesitas consultar tablas de permisos/membresías:
    const hasAccess = await this.validateUserAccessToCondo(user.sub, paramKey);

    if (!hasAccess) {
      throw new ForbiddenException(
        'No tienes permisos para acceder a los recursos de este condominio.',
      );
    }

    return true;
  }

  private async validateUserAccessToCondo(
    userId: string,
    condominiumKey: string,
  ): Promise<boolean> {
    // AQUÍ tu consulta a la BD (ej. vía Service o Repository)
    // ej: return await this.condoService.checkUserAccess(userId, condominiumKey);
    return false;
  }
}
