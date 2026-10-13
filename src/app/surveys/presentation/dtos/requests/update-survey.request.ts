import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SurveyStatus } from '../../../domain/entities/survey.entity';

export class UpdateSurveyRequest {
  @ApiPropertyOptional({
    description: 'Título de la encuesta',
    example: 'Votación para Remodelación de Alberca 2026 (Actualizada)',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  title?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado de la encuesta',
    enum: SurveyStatus,
  })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @ApiPropertyOptional({
    description: 'Indica si los residentes pueden ver los resultados',
  })
  @IsOptional()
  @IsBoolean()
  resultsVisibleToResidents?: boolean;

  @ApiPropertyOptional({
    description: 'Fecha límite de votación (ISO)',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
