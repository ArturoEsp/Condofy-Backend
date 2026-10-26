import { ApplicationException } from '@/core/application/error/application.exception';

export class NoReceiptsFoundException extends ApplicationException {
  readonly codeError = 404;

  constructor(
    message = 'No se encontraron recibos o pagos registrados para el periodo seleccionado.',
  ) {
    super(message);
  }
}

