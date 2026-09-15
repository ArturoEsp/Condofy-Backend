import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { CourierCompany } from '@/core/infrastructure/persistence/prisma/generated/client';

export class RegisterParcelRequest {
  @ApiProperty({
    description: 'ID de la casa destinataria',
    example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a1',
  })
  @IsUUID()
  @IsNotEmpty()
  houseId: string;

  @ApiProperty({
    enum: CourierCompany,
    description: 'Empresa transportista o de paquetería',
    example: CourierCompany.AMAZON,
  })
  @IsEnum(CourierCompany)
  @IsNotEmpty()
  courier: CourierCompany;

  @ApiPropertyOptional({
    description: 'Nombre personalizado si courier es OTHER',
    example: 'Mandados Locales',
  })
  @IsOptional()
  @IsString()
  customCourier?: string;

  @ApiPropertyOptional({
    description: 'Número de guía o tracking impreso en la etiqueta',
    example: 'TBA30192837482',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'Cantidad de bultos o paquetes recibidos',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  packageCount?: number;

  @ApiPropertyOptional({
    description: 'URL o base64 de la fotografía tomada en caseta',
  })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({
    description: 'Notas u observaciones del estado físico del paquete',
    example: 'Caja con ligera rotura en cinta de sellado.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
