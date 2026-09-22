import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ReviewResidentProofRequest {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'], example: 'APPROVE' })
  @IsEnum(['APPROVE', 'REJECT'])
  @IsNotEmpty()
  action: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ example: 'SPEI-CONFIRMADO-1234' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({
    example: 'El monto transferido no coincide con la cuota',
  })
  @IsString()
  @IsOptional()
  rejectReason?: string;
}
