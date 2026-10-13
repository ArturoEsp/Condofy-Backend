import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyAlreadyVotedException extends ApplicationException {
  readonly codeError = 409;

  constructor(message = 'Ya has registrado tu voto en esta encuesta.') {
    super(message);
  }
}
