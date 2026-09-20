import { ApplicationException } from '@/core/application/error/application.exception';

export class GeneralProviderNotFoundException extends ApplicationException {
  readonly codeError = 404;
  constructor(
    message = 'El registro del proveedor general no fue encontrado.',
  ) {
    super(message);
  }
}
