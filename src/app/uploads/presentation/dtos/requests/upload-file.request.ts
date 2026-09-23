import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum UploadModule {
  VISITORS = 'visitors',
  PARCELS = 'parcels',
  PAYMENTS = 'payments',
  BRANDING = 'branding',
  DOCUMENTS = 'documents',
  GENERAL = 'general',
}

export class UploadFileRequest {
  @ApiProperty({
    enum: UploadModule,
    description:
      'Módulo o categoría del archivo para organizar el almacenamiento',
    example: UploadModule.PARCELS,
  })
  @IsEnum(UploadModule, {
    message:
      'El módulo debe ser uno de: visitors, parcels, payments, branding, documents, general',
  })
  @IsNotEmpty({ message: 'El módulo es requerido' })
  module: UploadModule;

  @ApiPropertyOptional({
    description:
      'Identificador de referencia opcional (ej. ID de visita, ID de paquete, ID de pago)',
    example: 'd3b07384-d113-4f4c-9f6b-0b5c15e8f4a1',
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiPropertyOptional({
    description:
      'Indica si el archivo debe ser público (por defecto branding es público, los demás privados)',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isPublic?: boolean;
}
