import { ApplicationException } from '@/core/application/error/application.exception';

export class InvalidDateRangeException extends ApplicationException {
  readonly codeError = 400;
  constructor(
    message = 'La fecha de fin debe ser posterior a la fecha de inicio.',
  ) {
    super(message);
  }
}
