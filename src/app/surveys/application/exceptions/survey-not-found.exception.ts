import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyNotFoundException extends ApplicationException {
  readonly codeError = 404;

  constructor(message = 'La encuesta no fue encontrada.') {
    super(message);
  }
}
