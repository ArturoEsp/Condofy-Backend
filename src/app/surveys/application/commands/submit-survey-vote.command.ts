export interface SurveyAnswerVoteCommand {
  questionId: string;
  optionIds: string[];
}

export interface SubmitSurveyVoteCommand {
  surveyId: string;
  condominiumId: string;
  userId: string;
  answers: SurveyAnswerVoteCommand[];
}
