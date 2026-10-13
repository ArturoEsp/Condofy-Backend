import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResidentSurveyStatusResponse {
  @ApiProperty({ example: 'survey-123' })
  @Expose()
  surveyId: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el residente puede emitir un voto',
  })
  @Expose()
  canVote: boolean;

  @ApiPropertyOptional({ example: 'Tu casa ya votó a través de Carlos Gómez.' })
  @Expose()
  reasonCannotVote?: string;

  @ApiProperty({ example: false })
  @Expose()
  hasUserVoted: boolean;

  @ApiProperty({ example: true })
  @Expose()
  hasHouseVoted: boolean;

  @ApiPropertyOptional({ example: 'Carlos Gómez' })
  @Expose()
  voterName?: string;

  @ApiPropertyOptional({ example: '2026-10-12T10:30:00.000Z' })
  @Expose()
  submittedAt?: Date;
}
