import { ApplicationException } from '@/core/application/error/application.exception';

export class CannotDeleteUsedAccessAuthorizationException extends ApplicationException {
  readonly codeError = 400;
  constructor(
    message = 'No es posible eliminar una autorización de acceso que ya ha sido utilizada o cuenta con registros en bitácora.',
  ) {
    super(message);
  }
}
