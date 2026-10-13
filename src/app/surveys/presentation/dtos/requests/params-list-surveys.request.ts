import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SurveyStatus } from '../../../domain/entities/survey.entity';

export class ParamsListSurveysRequest {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de la encuesta',
    enum: SurveyStatus,
  })
  @IsOptional()
  @IsEnum(SurveyStatus)
  status?: SurveyStatus;

  @ApiPropertyOptional({
    description: 'Búsqueda por texto en título o descripción',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
