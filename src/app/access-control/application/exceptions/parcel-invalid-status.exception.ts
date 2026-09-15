import { ApplicationException } from '@/core/application/error/application.exception';

export class ParcelInvalidStatusException extends ApplicationException {
  readonly codeError = 400;
  constructor(message = 'El paquete no se encuentra en custodia.') {
    super(message);
  }
}
