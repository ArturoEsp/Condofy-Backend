import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { EntryType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class RegisterAccessLogRequest {
  @ApiProperty({
    description: 'ID único del pase de acceso a registrar',
    example: 'f5127271-9f93-410e-84b2-c0e86a01b22e',
  })
  @IsUUID()
  @IsNotEmpty()
  accessAuthorizationId: string;

  @ApiProperty({
    enum: EntryType,
    description: 'Tipo de registro: ENTRY (Entrada) o EXIT (Salida)',
    example: EntryType.ENTRY,
  })
  @IsEnum(EntryType)
  @IsNotEmpty()
  entryType: EntryType;

  @ApiPropertyOptional({
    description: 'Observaciones o notas tomadas por el guardia en caseta',
    example: 'Dejó identificación oficial INE en caseta.',
  })
  @IsOptional()
  @IsString()
  observations?: string;
}
