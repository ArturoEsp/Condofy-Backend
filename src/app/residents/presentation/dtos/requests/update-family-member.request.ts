import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UpdateFamilyMemberRequest {
  @ApiPropertyOptional({
    description: 'Nombre del familiar o inquilino',
    example: 'Carlos',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Apellidos del familiar o inquilino',
    example: 'Gómez López',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+525512345678',
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  phone?: string;

  @ApiPropertyOptional({
    description: 'Nuevo correo electrónico',
    example: 'carlos.nuevo@gmail.com',
  })
  @IsString()
  @IsEmail()
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email?: string;

  @ApiPropertyOptional({
    description: 'Nueva contraseña (mínimo 8 caracteres)',
    example: 'NewPassword123!',
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  password?: string;

  @ApiPropertyOptional({
    description: 'Rol en el hogar: FAMILY_MEMBER o TENANT',
    enum: [ResidentType.FAMILY_MEMBER, ResidentType.TENANT],
  })
  @IsIn([ResidentType.FAMILY_MEMBER, ResidentType.TENANT], {
    message: 'El rol en el hogar debe ser FAMILY_MEMBER o TENANT',
  })
  @IsOptional()
  residentType?: Extract<ResidentType, 'FAMILY_MEMBER' | 'TENANT'>;

  @ApiPropertyOptional({
    description: 'Indica si tiene permisos para registrar y autorizar visitas',
  })
  @IsBoolean()
  @IsOptional()
  canCreateVisits?: boolean;

  @ApiPropertyOptional({ description: 'Observaciones o notas adicionales' })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  comments?: string;
}
