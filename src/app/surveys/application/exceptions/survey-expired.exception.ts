import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyExpiredException extends ApplicationException {
  readonly codeError = 400;

  constructor(
    message = 'El periodo para responder esta encuesta ha concluido.',
  ) {
    super(message);
  }
}
