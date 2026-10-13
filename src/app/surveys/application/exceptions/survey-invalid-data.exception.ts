import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyInvalidDataException extends ApplicationException {
  readonly codeError = 400;

  constructor(message = 'Datos de la encuesta no válidos.') {
    super(message);
  }
}
