import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyNotActiveException extends ApplicationException {
  readonly codeError = 400;

  constructor(
    message = 'Esta encuesta no se encuentra activa para recibir votos.',
  ) {
    super(message);
  }
}
