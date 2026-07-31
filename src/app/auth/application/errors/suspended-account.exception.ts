import { ApplicationException } from '@/core/application/error/application.exception';

export class SuspendedAccountException extends ApplicationException {
  readonly codeError = 400;

  constructor() {
    super('Tu cuenta ha sido suspendida, contacta al administrador.');
  }
}
