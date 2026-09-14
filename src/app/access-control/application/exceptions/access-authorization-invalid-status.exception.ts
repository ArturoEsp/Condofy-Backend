import { ApplicationException } from '@/core/application/error/application.exception';

export class AccessAuthorizationInvalidStatusException extends ApplicationException {
  readonly codeError = 400;
  constructor(
    message = 'El pase de acceso no se encuentra activo o ha expirado.',
  ) {
    super(message);
  }
}
