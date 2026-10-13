import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  SurveyQuestionType,
  SurveyStatus,
  SurveyVoteType,
} from '../../../domain/entities/survey.entity';

export class CreateSurveyOptionDto {
  @ApiProperty({
    description: 'Texto de la opción de respuesta',
    example: 'A favor',
  })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiPropertyOptional({ description: 'Orden de la opción', example: 0 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;
}

export class CreateSurveyQuestionDto {
  @ApiProperty({
    description: 'Título de la pregunta',
    example: '¿Aprueba pintar la fachada?',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Descripción o contexto de la pregunta' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Tipo de pregunta',
    enum: SurveyQuestionType,
    example: SurveyQuestionType.SINGLE_CHOICE,
  })
  @IsEnum(SurveyQuestionType)
  type: SurveyQuestionType;

  @ApiPropertyOptional({
    description: 'Indica si es obligatoria',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: 'Orden de la pregunta', example: 0 })
  @IsOptional()
  @IsInt()
  orderIndex?: number;

  @ApiProperty({
    description: 'Lista de opciones de respuesta',
    type: [CreateSurveyOptionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyOptionDto)
  options: CreateSurveyOptionDto[];
}

export class CreateSurveyRequest {
  @ApiProperty({
    description: 'Título de la encuesta',
    example: 'Votación para Remodelación de Alberca 2026',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada',
    example:
      'Se somete a votación el presupuesto para remodelar el piso de la alberca.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado inicial de la encuesta',
    enum: SurveyStatus,
    default: SurveyStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @ApiPropertyOptional({
    description: 'Modalidad de conteo de votos',
    enum: SurveyVoteType,
    default: SurveyVoteType.PER_HOUSE,
  })
  @IsOptional()
  @IsEnum(SurveyVoteType)
  voteType?: SurveyVoteType;

  @ApiPropertyOptional({
    description: 'Indica si las respuestas son anónimas',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiPropertyOptional({
    description:
      'Indica si los residentes pueden ver los resultados mientras esté activa o cerrada',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  resultsVisibleToResidents?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO)',
    example: '2026-10-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha límite de votación (ISO)',
    example: '2026-10-25T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Preguntas que componen la encuesta',
    type: [CreateSurveyQuestionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSurveyQuestionDto)
  questions: CreateSurveyQuestionDto[];
}
