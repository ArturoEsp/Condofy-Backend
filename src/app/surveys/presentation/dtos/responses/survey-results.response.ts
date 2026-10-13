import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { SurveyQuestionType } from '../../../domain/entities/survey.entity';
import { SurveyResponse } from './survey.response';

export class SurveyOptionResultResponse {
  @ApiProperty({ example: 'opt-123' })
  @Expose()
  optionId: string;

  @ApiProperty({ example: 'A favor' })
  @Expose()
  text: string;

  @ApiProperty({ example: 42 })
  @Expose()
  votesCount: number;

  @ApiProperty({
    example: 70.0,
    description: 'Porcentaje respecto al total de respuestas',
  })
  @Expose()
  percentage: number;
}

export class SurveyQuestionResultResponse {
  @ApiProperty({ example: 'q-123' })
  @Expose()
  questionId: string;

  @ApiProperty({ example: '¿Aprueba la remodelación de la alberca?' })
  @Expose()
  title: string;

  @ApiProperty({
    enum: SurveyQuestionType,
    example: SurveyQuestionType.SINGLE_CHOICE,
  })
  @Expose()
  type: SurveyQuestionType;

  @ApiProperty({ example: true })
  @Expose()
  isRequired: boolean;

  @ApiProperty({ example: 60 })
  @Expose()
  totalVotesForQuestion: number;

  @ApiProperty({ type: [SurveyOptionResultResponse] })
  @Expose()
  @Type(() => SurveyOptionResultResponse)
  options: SurveyOptionResultResponse[];
}

export class SurveyResultsResponse {
  @ApiProperty({ type: SurveyResponse })
  @Expose()
  @Type(() => SurveyResponse)
  survey: SurveyResponse;

  @ApiProperty({
    example: 80,
    description: 'Total de casas o residentes en el condominio',
  })
  @Expose()
  totalEligibleUnits: number;

  @ApiProperty({
    example: 60,
    description: 'Total de respuestas/votos recibidos',
  })
  @Expose()
  totalResponsesCount: number;

  @ApiProperty({
    example: 75.0,
    description: 'Porcentaje de participación / quórum',
  })
  @Expose()
  participationPercentage: number;

  @ApiProperty({ type: [SurveyQuestionResultResponse] })
  @Expose()
  @Type(() => SurveyQuestionResultResponse)
  questions: SurveyQuestionResultResponse[];
}
