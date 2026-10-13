import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyAlreadyHasResponsesException extends ApplicationException {
  readonly codeError = 400;

  constructor(
    message = 'Esta encuesta ya cuenta con respuestas registradas y no puede ser eliminada. Para preservarla y ocultarla, debes archivarla.',
  ) {
    super(message);
  }
}
