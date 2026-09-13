import { ApplicationException } from '@/core/application/error/application.exception';

export class CannotCreateVisitsException extends ApplicationException {
  readonly codeError = 403;
  constructor(
    message = 'El residente no cuenta con permisos para crear autorizaciones de acceso.',
  ) {
    super(message);
  }
}
