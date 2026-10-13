import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/surveys.docs';

import { CreateSurveyUseCase } from '../../application/use-cases/create-survey.usecase';
import { GetSurveysUseCase } from '../../application/use-cases/get-surveys.usecase';
import { GetSurveyByIdUseCase } from '../../application/use-cases/get-survey-by-id.usecase';
import { UpdateSurveyUseCase } from '../../application/use-cases/update-survey.usecase';
import { ChangeSurveyStatusUseCase } from '../../application/use-cases/change-survey-status.usecase';
import { ArchiveSurveyUseCase } from '../../application/use-cases/archive-survey.usecase';
import { DeleteSurveyUseCase } from '../../application/use-cases/delete-survey.usecase';
import { SubmitSurveyVoteUseCase } from '../../application/use-cases/submit-survey-vote.usecase';
import { GetSurveyResultsUseCase } from '../../application/use-cases/get-survey-results.usecase';
import { GetResidentSurveysUseCase } from '../../application/use-cases/get-resident-surveys.usecase';
import { GetResidentSurveyStatusUseCase } from '../../application/use-cases/get-resident-survey-status.usecase';
import { SendSurveyReminderUseCase } from '../../application/use-cases/send-survey-reminder.usecase';

import { CreateSurveyRequest } from '../dtos/requests/create-survey.request';
import { UpdateSurveyRequest } from '../dtos/requests/update-survey.request';
import { ChangeSurveyStatusRequest } from '../dtos/requests/change-survey-status.request';
import { ParamsListSurveysRequest } from '../dtos/requests/params-list-surveys.request';
import { SubmitSurveyVoteRequest } from '../dtos/requests/submit-survey-vote.request';
import { SurveyResponse } from '../dtos/responses/survey.response';
import { SurveyResultsResponse } from '../dtos/responses/survey-results.response';
import { ResidentSurveyStatusResponse } from '../dtos/responses/resident-survey-status.response';

@ApiTags('Surveys')
@Controller(':condominiumKey/surveys')
export class SurveysController {
  constructor(
    private readonly createSurveyUseCase: CreateSurveyUseCase,
    private readonly getSurveysUseCase: GetSurveysUseCase,
    private readonly getSurveyByIdUseCase: GetSurveyByIdUseCase,
    private readonly updateSurveyUseCase: UpdateSurveyUseCase,
    private readonly changeSurveyStatusUseCase: ChangeSurveyStatusUseCase,
    private readonly archiveSurveyUseCase: ArchiveSurveyUseCase,
    private readonly deleteSurveyUseCase: DeleteSurveyUseCase,
    private readonly submitSurveyVoteUseCase: SubmitSurveyVoteUseCase,
    private readonly getSurveyResultsUseCase: GetSurveyResultsUseCase,
    private readonly getResidentSurveysUseCase: GetResidentSurveysUseCase,
    private readonly getResidentSurveyStatusUseCase: GetResidentSurveyStatusUseCase,
    private readonly sendSurveyReminderUseCase: SendSurveyReminderUseCase,
  ) {}

  @Post()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.createSurvey)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() body: CreateSurveyRequest,
  ): Promise<SurveyResponse> {
    return this.createSurveyUseCase.execute({
      condominiumId,
      title: body.title,
      description: body.description,
      status: body.status,
      voteType: body.voteType,
      isAnonymous: body.isAnonymous,
      resultsVisibleToResidents: body.resultsVisibleToResidents,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      createdById: user.id,
      questions: body.questions.map((q) => ({
        title: q.title,
        description: q.description,
        type: q.type,
        isRequired: q.isRequired ?? true,
        orderIndex: q.orderIndex,
        options: q.options.map((opt) => ({
          text: opt.text,
          orderIndex: opt.orderIndex,
        })),
      })),
    });
  }

  @Get()
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.getSurveys)
  async findAll(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListSurveysRequest,
  ): Promise<{ surveys: SurveyResponse[]; total: number }> {
    return this.getSurveysUseCase.execute({
      condominiumId,
      status: params.status,
      search: params.search,
      page: params.page,
      limit: params.limit,
    });
  }

  @Get('my-available')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.getResidentSurveys)
  async getResidentSurveys(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Query() params: ParamsListSurveysRequest,
  ): Promise<{ surveys: SurveyResponse[]; total: number }> {
    return this.getResidentSurveysUseCase.execute({
      condominiumId,
      userId: user.id,
      search: params.search,
      page: params.page,
      limit: params.limit,
    });
  }

  @Get(':id/my-status')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.getResidentSurveyStatus)
  async getResidentSurveyStatus(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') surveyId: string,
  ): Promise<ResidentSurveyStatusResponse> {
    return this.getResidentSurveyStatusUseCase.execute({
      surveyId,
      condominiumId,
      userId: user.id,
    });
  }

  @Post(':id/vote')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.submitSurveyVote)
  async submitVote(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') surveyId: string,
    @Body() body: SubmitSurveyVoteRequest,
  ): Promise<{ message: string }> {
    return this.submitSurveyVoteUseCase.execute({
      surveyId,
      condominiumId,
      userId: user.id,
      answers: body.answers,
    });
  }

  @Post(':id/remind')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.sendSurveyReminder)
  async sendReminder(
    @CondominiumId() condominiumId: string,
    @Param('id') surveyId: string,
  ): Promise<{ notifiedResidentsCount: number }> {
    return this.sendSurveyReminderUseCase.execute({
      surveyId,
      condominiumId,
    });
  }

  @Get(':id/results')
  @Roles('ADMIN', 'SUPERADMIN', 'RESIDENT')
  @ApiEndpoint(docs.getSurveyResults)
  async getResults(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('id') surveyId: string,
  ): Promise<SurveyResultsResponse> {
    return this.getSurveyResultsUseCase.execute({
      surveyId,
      condominiumId,
      userRole: user.role,
    });
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPERADMIN', 'RESIDENT')
  @ApiEndpoint(docs.getSurveyById)
  async findById(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<SurveyResponse> {
    return this.getSurveyByIdUseCase.execute(id, condominiumId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.updateSurvey)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() body: UpdateSurveyRequest,
  ): Promise<SurveyResponse> {
    return this.updateSurveyUseCase.execute({
      id,
      condominiumId,
      title: body.title,
      description: body.description,
      status: body.status,
      resultsVisibleToResidents: body.resultsVisibleToResidents,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    });
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.changeSurveyStatus)
  async changeStatus(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() body: ChangeSurveyStatusRequest,
  ): Promise<SurveyResponse> {
    return this.changeSurveyStatusUseCase.execute({
      id,
      condominiumId,
      status: body.status,
    });
  }

  @Patch(':id/archive')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.archiveSurvey)
  async archive(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<SurveyResponse> {
    return this.archiveSurveyUseCase.execute({
      id,
      condominiumId,
    });
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPERADMIN')
  @ApiEndpoint(docs.deleteSurvey)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.deleteSurveyUseCase.execute({
      id,
      condominiumId,
    });
  }
}
