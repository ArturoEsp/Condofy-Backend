import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SurveyVoteAnswerDto {
  @ApiProperty({
    description: 'ID de la pregunta',
    example: 'd9b1c7c2-1234-4567-89ab-cdef01234567',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Array de IDs de las opciones seleccionadas',
    example: ['e8a2b3c4-1234-4567-89ab-cdef01234567'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  optionIds: string[];
}

export class SubmitSurveyVoteRequest {
  @ApiProperty({
    description: 'Respuestas a cada una de las preguntas de la encuesta',
    type: [SurveyVoteAnswerDto],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => SurveyVoteAnswerDto)
  answers: SurveyVoteAnswerDto[];
}
