import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { SurveyStatus } from '../../../domain/entities/survey.entity';

export class ChangeSurveyStatusRequest {
  @ApiProperty({
    description: 'Nuevo estado de la encuesta',
    enum: SurveyStatus,
    example: SurveyStatus.ACTIVE,
  })
  @IsEnum(SurveyStatus)
  @IsNotEmpty()
  status: SurveyStatus;
}
