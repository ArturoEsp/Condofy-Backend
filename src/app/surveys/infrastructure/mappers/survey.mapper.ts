import { SurveyEntity, SurveyQuestionEntity, SurveyOptionEntity } from '../../domain/entities/survey.entity';

export class SurveyMapper {
  static toDomain(raw: any): SurveyEntity {
    const questions: SurveyQuestionEntity[] = Array.isArray(raw.questions)
      ? raw.questions.map((q: any) => ({
          id: q.id,
          surveyId: q.surveyId,
          title: q.title,
          description: q.description ?? null,
          type: q.type,
          isRequired: q.isRequired ?? true,
          orderIndex: q.orderIndex ?? 0,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
          options: Array.isArray(q.options)
            ? q.options.map((opt: any): SurveyOptionEntity => ({
                id: opt.id,
                questionId: opt.questionId,
                text: opt.text,
                orderIndex: opt.orderIndex ?? 0,
                createdAt: opt.createdAt,
              }))
            : [],
        }))
      : [];

    let creatorName: string | undefined = undefined;
    if (raw.createdBy) {
      creatorName = `${raw.createdBy.firstName || ''} ${raw.createdBy.lastName || ''}`.trim() || raw.createdBy.email;
    }

    return {
      id: raw.id,
      condominiumId: raw.condominiumId,
      title: raw.title,
      description: raw.description ?? null,
      status: raw.status,
      voteType: raw.voteType,
      isAnonymous: raw.isAnonymous,
      resultsVisibleToResidents: raw.resultsVisibleToResidents,
      startDate: raw.startDate,
      endDate: raw.endDate ?? null,
      createdById: raw.createdById,
      creatorName,
      questions,
      totalResponsesCount: raw._count?.responses ?? raw.responsesCount ?? undefined,
      hasUserVoted: raw.hasUserVoted ?? undefined,
      hasHouseVoted: raw.hasHouseVoted ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

