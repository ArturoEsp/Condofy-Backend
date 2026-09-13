import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class CreateVisitorRequest {
  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del visitante',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del visitante es requerido.' })
  firstName: string;

  @ApiPropertyOptional({
    example: 'Pérez García',
    description: 'Apellidos del visitante',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+525512345678',
    description: 'Teléfono de contacto del visitante',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico del visitante',
  })
  @IsEmail({}, { message: 'El formato del correo es inválido.' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.condofy.com/photos/visitor1.jpg',
    description: 'URL de la fotografía del visitante',
  })
  @IsString()
  @IsOptional()
  photo?: string;

  @ApiProperty({
    enum: VisitorCategory,
    example: VisitorCategory.FRIEND,
    description:
      'Categoría: FAMILY, FRIEND, DELIVERY, SERVICE, EMPLOYEE, OTHER',
  })
  @IsEnum(VisitorCategory, {
    message: 'La categoría del visitante no es válida.',
  })
  @IsNotEmpty({ message: 'La categoría es requerida.' })
  category: VisitorCategory;

  @ApiPropertyOptional({
    example: 'ABC-123-D',
    description: 'Placa del vehículo habitual del visitante',
  })
  @IsString()
  @IsOptional()
  vehiclePlate?: string;

  @ApiPropertyOptional({
    example: 'Amigo de la universidad / Jardinero',
    description: 'Notas o comentarios sobre el visitante',
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
