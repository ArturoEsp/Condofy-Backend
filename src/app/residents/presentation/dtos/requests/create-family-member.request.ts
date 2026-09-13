import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class CreateFamilyMemberRequest {
  @ApiProperty({
    description: 'Nombre del familiar o inquilino',
    example: 'Carlos',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Apellidos del familiar o inquilino',
    example: 'Gómez López',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+525512345678',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Correo electrónico único para inicio de sesión',
    example: 'carlos.gomez@gmail.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Contraseña de acceso (mínimo 8 caracteres)',
    example: 'Password123!',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'Rol en el hogar: FAMILY_MEMBER o TENANT',
    enum: [ResidentType.FAMILY_MEMBER, ResidentType.TENANT],
    example: ResidentType.FAMILY_MEMBER,
  })
  @IsIn([ResidentType.FAMILY_MEMBER, ResidentType.TENANT], {
    message: 'El rol en el hogar debe ser FAMILY_MEMBER o TENANT',
  })
  residentType: Extract<ResidentType, 'FAMILY_MEMBER' | 'TENANT'>;

  @ApiPropertyOptional({
    description: 'Indica si tiene permisos para registrar y autorizar visitas',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  canCreateVisits?: boolean;

  @ApiPropertyOptional({ description: 'Observaciones o notas adicionales' })
  @IsString()
  @IsOptional()
  comments?: string;
}
