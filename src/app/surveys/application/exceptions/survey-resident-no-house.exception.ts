import { ApplicationException } from '@/core/application/error/application.exception';

export class SurveyResidentNoHouseException extends ApplicationException {
  readonly codeError = 400;

  constructor(
    message = 'Debes pertenecer a una casa asignada para participar en votaciones por unidad privativa.',
  ) {
    super(message);
  }
}
