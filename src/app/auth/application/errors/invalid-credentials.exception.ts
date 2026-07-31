import { ApplicationException } from '@/core/application/error/application.exception';

export class InvalidCredentialsException extends ApplicationException {
  readonly codeError = 400;

  constructor() {
    super('Credenciales invalidas, intenta de nuevo.');
  }
}
