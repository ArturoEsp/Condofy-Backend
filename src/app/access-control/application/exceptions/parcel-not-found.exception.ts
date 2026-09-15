import { ApplicationException } from '@/core/application/error/application.exception';

export class ParcelNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(message = 'El paquete o encomienda no fue encontrado.') {
    super(message);
  }
}
