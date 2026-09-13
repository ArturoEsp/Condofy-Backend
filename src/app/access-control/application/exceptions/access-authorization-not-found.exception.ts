import { ApplicationException } from '@/core/application/error/application.exception';

export class AccessAuthorizationNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(message = 'La autorización de acceso no fue encontrada.') {
    super(message);
  }
}
