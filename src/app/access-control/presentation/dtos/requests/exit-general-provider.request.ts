import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class ExitGeneralProviderRequest {
  @ApiPropertyOptional({
    description:
      'Observaciones de salida (ej. Todo en orden, concluyó reparto)',
    example: 'Concluyó recorrido sin novedades',
  })
  @IsOptional()
  @IsString()
  exitNotes?: string;

  @ApiPropertyOptional({
    description:
      'Si se debe enviar notificación push a los residentes sobre la salida',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyResidents?: boolean;
}
