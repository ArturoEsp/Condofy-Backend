import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadResidentProofRequest {
  @ApiPropertyOptional({ example: 'SPEI-94827104' })
  @IsString()
  @IsOptional()
  transactionReference?: string;

  @ApiPropertyOptional({ example: 'Transferencia realizada desde BBVA' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'URL o base64 del comprobante si no se envía como archivo',
  })
  @IsString()
  @IsOptional()
  proofUrl?: string;

  @ApiPropertyOptional({ example: 'comprobante_septiembre.pdf' })
  @IsString()
  @IsOptional()
  fileName?: string;
}
