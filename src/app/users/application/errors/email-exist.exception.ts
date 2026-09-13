import { ApplicationException } from '@/core/application/error/application.exception';

export class EmailExistException extends ApplicationException {
  readonly codeError = 404;

  constructor() {
    super(`El email ya se encuentra registrado.`);
  }
}
