import { ApplicationException } from '@/core/application/error/application.exception';

export class HouseNotExistsException extends ApplicationException {
  readonly codeError = 404;

  constructor() {
    super(`El Id de la casa no existe.`);
  }
}
