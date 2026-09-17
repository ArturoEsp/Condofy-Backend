import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class BatchExitRequest {
  @ApiProperty({
    description: 'Lista de IDs de autorización de acceso para registrar salida',
    example: ['f5127271-9f93-410e-84b2-c0e86a01b22e'],
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  accessAuthorizationIds: string[];

  @ApiPropertyOptional({
    description: 'Observaciones opcionales para los registros de salida',
    example: 'Salida rápida registrada desde bitácora de caseta',
  })
  @IsString()
  @IsOptional()
  observations?: string;
}
