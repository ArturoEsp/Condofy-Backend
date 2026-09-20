import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { GeneralProviderCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class RegisterGeneralProviderRequest {
  @ApiProperty({
    description: 'Nombre de la empresa o proveedor general',
    example: 'Agua Ciel',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: GeneralProviderCategory,
    description: 'Categoría del servicio',
    example: GeneralProviderCategory.WATER,
  })
  @IsEnum(GeneralProviderCategory)
  @IsNotEmpty()
  category: GeneralProviderCategory;

  @ApiPropertyOptional({
    description: 'Nombre del conductor o responsable',
    example: 'Juan Carlos López',
  })
  @IsOptional()
  @IsString()
  driverName?: string;

  @ApiPropertyOptional({
    description: 'Placas o identificación del vehículo',
    example: 'ABC-123-D',
  })
  @IsOptional()
  @IsString()
  vehiclePlate?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto de la empresa o repartidor',
    example: '+525512345678',
  })
  @IsOptional()
  @IsString()
  companyPhone?: string;

  @ApiPropertyOptional({
    description: 'Observaciones o notas de acceso',
    example: 'Camión repartidor con garrafones de 20L',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Si se debe enviar notificación push a los residentes',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyResidents?: boolean;
}
