import { ApplicationException } from '@/core/application/error/application.exception';

export class GeneralProviderAlreadyExitedException extends ApplicationException {
  readonly codeError = 400;
  constructor(
    message = 'El proveedor general ya ha registrado su salida previamente.',
  ) {
    super(message);
  }
}
