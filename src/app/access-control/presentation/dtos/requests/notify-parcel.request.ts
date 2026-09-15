import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class NotifyParcelRequest {
  @ApiPropertyOptional({
    description: 'Teléfono celular del residente al cual enviar el mensaje',
    example: '525512345678',
  })
  @IsOptional()
  @IsString()
  recipientPhone?: string;
}
