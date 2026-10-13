import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { SurveyNotFoundException } from '../../application/exceptions/survey-not-found.exception';
import {
  CreateSurveyData,
  FindSurveysFilter,
  SubmitVoteData,
  SurveyQuestionResult,
  SurveyResultsData,
  SurveysRepository,
  UpdateSurveyData,
} from '../../domain/repositories/surveys.repository';
import {
  SurveyEntity,
  SurveyStatus,
  SurveyVoteType,
} from '../../domain/entities/survey.entity';
import { SurveyMapper } from '../mappers/survey.mapper';

@Injectable()
export class SurveysPrismaRepository implements SurveysRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateSurveyData): Promise<SurveyEntity> {
    const created = await this.prisma.survey.create({
      data: {
        condominiumId: data.condominiumId,
        title: data.title,
        description: data.description,
        status: data.status ?? 'DRAFT',
        voteType: data.voteType ?? 'PER_HOUSE',
        isAnonymous: data.isAnonymous ?? false,
        resultsVisibleToResidents: data.resultsVisibleToResidents ?? true,
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate,
        createdById: data.createdById,
        questions: {
          create: data.questions.map((q, qIndex) => ({
            title: q.title,
            description: q.description,
            type: q.type,
            isRequired: q.isRequired ?? true,
            orderIndex: q.orderIndex ?? qIndex,
            options: {
              create: q.options.map((opt, optIndex) => ({
                text: opt.text,
                orderIndex: opt.orderIndex ?? optIndex,
              })),
            },
          })),
        },
      },
      include: {
        createdBy: true,
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    return SurveyMapper.toDomain(created);
  }

  async findById(id: string, condominiumId: string): Promise<SurveyEntity | null> {
    const survey = await this.prisma.survey.findFirst({
      where: { id, condominiumId },
      include: {
        createdBy: true,
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    return survey ? SurveyMapper.toDomain(survey) : null;
  }

  async findAll(
    filter: FindSurveysFilter,
  ): Promise<{ surveys: SurveyEntity[]; total: number }> {
    const { condominiumId, status, search, page = 1, limit = 20, userId, houseId } = filter;
    const skip = (page - 1) * limit;

    const where: any = {
      condominiumId,
    };

    if (status) {
      where.status = status;
    }

    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const [rawSurveys, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          createdBy: true,
          questions: {
            include: {
              options: {
                orderBy: { orderIndex: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: { responses: true },
          },
        },
      }),
      this.prisma.survey.count({ where }),
    ]);

    // Si se pasa userId o houseId, verificar cuáles encuestas ya fueron votadas
    let userVotedSurveyIds = new Set<string>();
    let houseVotedSurveyIds = new Set<string>();

    if (rawSurveys.length > 0) {
      const surveyIds = rawSurveys.map((s) => s.id);
      if (userId) {
        const userResponses = await this.prisma.surveyResponse.findMany({
          where: { surveyId: { in: surveyIds }, userId },
          select: { surveyId: true },
        });
        userVotedSurveyIds = new Set(userResponses.map((r) => r.surveyId));
      }

      if (houseId) {
        const houseResponses = await this.prisma.surveyResponse.findMany({
          where: { surveyId: { in: surveyIds }, houseId },
          select: { surveyId: true },
        });
        houseVotedSurveyIds = new Set(houseResponses.map((r) => r.surveyId));
      }
    }

    const surveys = rawSurveys.map((raw) => {
      const entity = SurveyMapper.toDomain(raw);
      if (userId) {
        entity.hasUserVoted = userVotedSurveyIds.has(entity.id);
      }
      if (houseId) {
        entity.hasHouseVoted = houseVotedSurveyIds.has(entity.id);
      }
      return entity;
    });

    return { surveys, total };
  }

  async update(
    id: string,
    condominiumId: string,
    data: UpdateSurveyData,
  ): Promise<SurveyEntity> {
    const updated = await this.prisma.survey.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.resultsVisibleToResidents !== undefined && {
          resultsVisibleToResidents: data.resultsVisibleToResidents,
        }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
      },
      include: {
        createdBy: true,
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    return SurveyMapper.toDomain(updated);
  }

  async changeStatus(
    id: string,
    condominiumId: string,
    status: SurveyStatus,
  ): Promise<SurveyEntity> {
    return this.update(id, condominiumId, { status });
  }

  async delete(id: string, condominiumId: string): Promise<void> {
    await this.prisma.survey.delete({
      where: { id },
    });
  }

  async countResponses(surveyId: string): Promise<number> {
    return this.prisma.surveyResponse.count({
      where: { surveyId },
    });
  }

  async hasUserVoted(surveyId: string, userId: string): Promise<boolean> {
    const existing = await this.prisma.surveyResponse.findFirst({
      where: { surveyId, userId },
      select: { id: true },
    });
    return Boolean(existing);
  }

  async hasHouseVoted(
    surveyId: string,
    houseId: string,
  ): Promise<{ voted: boolean; voterName?: string; submittedAt?: Date }> {
    const existing = await this.prisma.surveyResponse.findFirst({
      where: { surveyId, houseId },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!existing) {
      return { voted: false };
    }

    let voterName: string | undefined = undefined;
    if (existing.user) {
      voterName = `${existing.user.firstName || ''} ${existing.user.lastName || ''}`.trim() || existing.user.email;
    }

    return {
      voted: true,
      voterName,
      submittedAt: existing.submittedAt,
    };
  }

  async submitVote(data: SubmitVoteData): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Crear el registro de respuesta
      const response = await tx.surveyResponse.create({
        data: {
          surveyId: data.surveyId,
          userId: data.userId,
          houseId: data.houseId ?? null,
        },
      });

      // 2. Crear las respuestas individuales por pregunta y opción
      const answerInserts: { responseId: string; questionId: string; optionId: string }[] = [];
      for (const ans of data.answers) {
        for (const optId of ans.optionIds) {
          answerInserts.push({
            responseId: response.id,
            questionId: ans.questionId,
            optionId: optId,
          });
        }
      }

      if (answerInserts.length > 0) {
        await tx.surveyAnswer.createMany({
          data: answerInserts,
        });
      }
    });
  }

  async getResults(surveyId: string, condominiumId: string): Promise<SurveyResultsData> {
    const surveyRaw = await this.prisma.survey.findFirst({
      where: { id: surveyId, condominiumId },
      include: {
        createdBy: true,
        questions: {
          include: {
            options: {
              orderBy: { orderIndex: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: { responses: true },
        },
      },
    });

    if (!surveyRaw) {
      throw new SurveyNotFoundException('Encuesta no encontrada.');
    }

    const survey = SurveyMapper.toDomain(surveyRaw);
    const totalResponsesCount = surveyRaw._count.responses;

    // Obtener total de unidades elegibles (casas o residentes)
    let totalEligibleUnits = 0;
    if (survey.voteType === 'PER_HOUSE') {
      totalEligibleUnits = await this.prisma.house.count({
        where: { condominiumId, isDisabled: false },
      });
    } else {
      totalEligibleUnits = await this.prisma.residentProfile.count({
        where: { condominiumId },
      });
    }

    const participationPercentage =
      totalEligibleUnits > 0
        ? Number(((totalResponsesCount / totalEligibleUnits) * 100).toFixed(1))
        : 0;

    // Conteo agrupado de votos por opción
    const optionVoteCounts = await this.prisma.surveyAnswer.groupBy({
      by: ['questionId', 'optionId'],
      where: {
        response: { surveyId },
      },
      _count: {
        id: true,
      },
    });

    const voteCountMap = new Map<string, number>();
    for (const item of optionVoteCounts) {
      voteCountMap.set(`${item.questionId}_${item.optionId}`, item._count.id);
    }

    const questions: SurveyQuestionResult[] = (survey.questions || []).map((q) => {
      // Sumar el total de votos emitidos en esta pregunta
      let totalVotesForQuestion = 0;
      for (const opt of q.options) {
        const count = voteCountMap.get(`${q.id}_${opt.id}`) || 0;
        totalVotesForQuestion += count;
      }

      const options = q.options.map((opt) => {
        const votesCount = voteCountMap.get(`${q.id}_${opt.id}`) || 0;
        // Para SINGLE_CHOICE o MULTIPLE_CHOICE, calculamos porcentaje respecto al total de respuestas (o total de votos)
        const percentage =
          totalResponsesCount > 0
            ? Number(((votesCount / totalResponsesCount) * 100).toFixed(1))
            : 0;

        return {
          optionId: opt.id,
          text: opt.text,
          votesCount,
          percentage,
        };
      });

      return {
        questionId: q.id,
        title: q.title,
        type: q.type,
        isRequired: q.isRequired,
        totalVotesForQuestion,
        options,
      };
    });

    return {
      survey,
      totalEligibleUnits,
      totalResponsesCount,
      participationPercentage,
      questions,
    };
  }

  async findResidentContext(
    userId: string,
    condominiumId: string,
  ): Promise<{ houseId: string | null; residentType: string | null }> {
    const profile = await this.prisma.residentProfile.findFirst({
      where: { userId, condominiumId },
      select: { houseId: true, residentType: true },
    });

    return {
      houseId: profile?.houseId ?? null,
      residentType: profile?.residentType ?? null,
    };
  }

  async findAllResidentUserIds(condominiumId: string): Promise<string[]> {
    const residents = await this.prisma.residentProfile.findMany({
      where: { condominiumId },
      select: { userId: true },
    });

    return Array.from(
      new Set(
        residents
          .map((r) => r.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    );
  }

  async findNonVoterUserIds(
    surveyId: string,
    condominiumId: string,
    voteType: SurveyVoteType,
  ): Promise<string[]> {
    if (voteType === 'PER_HOUSE') {
      const votedHouses = await this.prisma.surveyResponse.findMany({
        where: { surveyId, houseId: { not: null } },
        select: { houseId: true },
      });

      const votedHouseIds = votedHouses
        .map((r) => r.houseId)
        .filter((id): id is string => Boolean(id));

      const nonVotingResidents = await this.prisma.residentProfile.findMany({
        where: {
          condominiumId,
          ...(votedHouseIds.length > 0 && {
            houseId: { notIn: votedHouseIds },
          }),
        },
        select: { userId: true },
      });

      return Array.from(
        new Set(
          nonVotingResidents
            .map((r) => r.userId)
            .filter((id): id is string => Boolean(id)),
        ),
      );
    } else {
      const votedUsers = await this.prisma.surveyResponse.findMany({
        where: { surveyId, userId: { not: null } },
        select: { userId: true },
      });

      const votedUserIds = votedUsers
        .map((r) => r.userId)
        .filter((id): id is string => Boolean(id));

      const nonVotingResidents = await this.prisma.residentProfile.findMany({
        where: {
          condominiumId,
          ...(votedUserIds.length > 0 && {
            userId: { notIn: votedUserIds },
          }),
        },
        select: { userId: true },
      });

      return Array.from(
        new Set(
          nonVotingResidents
            .map((r) => r.userId)
            .filter((id): id is string => Boolean(id)),
        ),
      );
    }
  }
}

