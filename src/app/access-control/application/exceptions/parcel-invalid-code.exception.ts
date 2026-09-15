import { ApplicationException } from '@/core/application/error/application.exception';

export class ParcelInvalidCodeException extends ApplicationException {
  readonly codeError = 400;
  constructor(
    message = 'El código PIN de retiro proporcionado es incorrecto.',
  ) {
    super(message);
  }
}
