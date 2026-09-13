import { ApplicationException } from '@/core/application/error/application.exception';

export class VisitorNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(message = 'El visitante no fue encontrado en este hogar.') {
    super(message);
  }
}
