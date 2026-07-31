import { ApplicationException } from '@/core/application/error/application.exception';

export class FatalErrorException extends ApplicationException {
  readonly codeError = 500;
  readonly stack = null;

  constructor(msg = 'Ocurrió un error fatal.', stack = null) {
    super(msg);
    this.stack = stack;
  }
}
