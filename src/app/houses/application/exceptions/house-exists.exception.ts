import { ApplicationException } from '@/core/application/error/application.exception';

export class HouseExistsException extends ApplicationException {
  readonly codeError = 409;

  constructor() {
    super(`La casa ya se encuentra registrada.`);
  }
}
