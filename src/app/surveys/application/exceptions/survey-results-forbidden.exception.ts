import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyResultsForbiddenException extends ApplicationException {
  readonly codeError = 403;

  constructor(
    message = 'La administración no ha habilitado la visualización de resultados para los residentes en esta encuesta.',
  ) {
    super(message);
  }
}
