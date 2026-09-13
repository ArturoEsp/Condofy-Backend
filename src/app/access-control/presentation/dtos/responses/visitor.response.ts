import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class VisitorResponse {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador único del visitante',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440000',
    description: 'ID de la casa a la que pertenece',
  })
  @Expose()
  houseId: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del visitante',
  })
  @Expose()
  firstName: string;

  @ApiPropertyOptional({
    example: 'Pérez García',
    description: 'Apellidos del visitante',
  })
  @Expose()
  lastName?: string;

  @ApiPropertyOptional({
    example: '+525512345678',
    description: 'Teléfono de contacto',
  })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({
    example: 'juan.perez@example.com',
    description: 'Correo electrónico',
  })
  @Expose()
  email?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.condofy.com/photos/visitor1.jpg',
    description: 'URL de fotografía del visitante',
  })
  @Expose()
  photo?: string;

  @ApiProperty({
    enum: VisitorCategory,
    example: VisitorCategory.FRIEND,
    description: 'Categoría del visitante',
  })
  @Expose()
  category: VisitorCategory;

  @ApiPropertyOptional({
    example: 'ABC-123-D',
    description: 'Placa del vehículo habitual del visitante',
  })
  @Expose()
  vehiclePlate?: string;

  @ApiPropertyOptional({
    example: 'Amigo de la universidad',
    description: 'Notas adicionales sobre el visitante',
  })
  @Expose()
  notes?: string;
}
