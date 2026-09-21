import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/browser';

export class UpdateResidentRequest {
  @ApiPropertyOptional({ description: 'Nombre(s) del residente' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Apellidos del residente' })
  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @IsNotEmpty({ message: 'Los apellidos no pueden estar vacíos' })
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico del residente' })
  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  @IsOptional()
  phone?: string | null;

  @ApiPropertyOptional({
    enum: ResidentType,
    description: 'Tipo o rol del residente (PRIMARY, TENANT, FAMILY_MEMBER)',
  })
  @IsEnum(ResidentType, { message: 'El tipo de residente no es válido' })
  @IsOptional()
  residentType?: ResidentType;

  @ApiPropertyOptional({ description: 'ID de la vivienda asignada' })
  @IsString({ message: 'El ID de la vivienda debe ser una cadena de texto' })
  @IsOptional()
  houseId?: string;

  @ApiPropertyOptional({ description: 'Comentarios u observaciones' })
  @IsString({ message: 'Los comentarios deben ser una cadena de texto' })
  @IsOptional()
  comments?: string;
}
