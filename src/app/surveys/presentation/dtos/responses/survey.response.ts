import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  SurveyQuestionType,
  SurveyStatus,
  SurveyVoteType,
} from '../../../domain/entities/survey.entity';

export class SurveyOptionResponse {
  @ApiProperty({ example: 'opt-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'q-123' })
  @Expose()
  questionId: string;

  @ApiProperty({ example: 'A favor' })
  @Expose()
  text: string;

  @ApiProperty({ example: 0 })
  @Expose()
  orderIndex: number;
}

export class SurveyQuestionResponse {
  @ApiProperty({ example: 'q-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'survey-123' })
  @Expose()
  surveyId: string;

  @ApiProperty({ example: '¿Aprueba la remodelación?' })
  @Expose()
  title: string;

  @ApiPropertyOptional({ example: 'Detalle adicional' })
  @Expose()
  description?: string | null;

  @ApiProperty({
    enum: SurveyQuestionType,
    example: SurveyQuestionType.SINGLE_CHOICE,
  })
  @Expose()
  type: SurveyQuestionType;

  @ApiProperty({ example: true })
  @Expose()
  isRequired: boolean;

  @ApiProperty({ example: 0 })
  @Expose()
  orderIndex: number;

  @ApiProperty({ type: [SurveyOptionResponse] })
  @Expose()
  @Type(() => SurveyOptionResponse)
  options: SurveyOptionResponse[];
}

export class SurveyResponse {
  @ApiProperty({ example: 'survey-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'condo-123' })
  @Expose()
  condominiumId: string;

  @ApiProperty({ example: 'Votación Alberca 2026' })
  @Expose()
  title: string;

  @ApiPropertyOptional({ example: 'Descripción detallada' })
  @Expose()
  description?: string | null;

  @ApiProperty({ enum: SurveyStatus, example: SurveyStatus.ACTIVE })
  @Expose()
  status: SurveyStatus;

  @ApiProperty({ enum: SurveyVoteType, example: SurveyVoteType.PER_HOUSE })
  @Expose()
  voteType: SurveyVoteType;

  @ApiProperty({ example: false })
  @Expose()
  isAnonymous: boolean;

  @ApiProperty({ example: true })
  @Expose()
  resultsVisibleToResidents: boolean;

  @ApiProperty({ example: '2026-10-15T00:00:00.000Z' })
  @Expose()
  startDate: Date;

  @ApiPropertyOptional({ example: '2026-10-25T23:59:59.000Z' })
  @Expose()
  endDate?: Date | null;

  @ApiProperty({ example: 'user-admin-123' })
  @Expose()
  createdById: string;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @Expose()
  creatorName?: string;

  @ApiPropertyOptional({ type: [SurveyQuestionResponse] })
  @Expose()
  @Type(() => SurveyQuestionResponse)
  questions?: SurveyQuestionResponse[];

  @ApiPropertyOptional({ example: 45 })
  @Expose()
  totalResponsesCount?: number;

  @ApiPropertyOptional({ example: true })
  @Expose()
  hasUserVoted?: boolean;

  @ApiPropertyOptional({ example: false })
  @Expose()
  hasHouseVoted?: boolean;

  @ApiProperty({ example: '2026-10-12T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-10-12T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
