import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  AuthorizationStatus,
  AuthorizationType,
  VisitorCategory,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class PublicPassVisitorResponse {
  @ApiProperty({
    example: 'Carlos',
    description: 'Nombre del visitante',
  })
  @Expose()
  firstName: string;

  @ApiPropertyOptional({
    example: 'García',
    description: 'Apellidos del visitante',
  })
  @Expose()
  lastName?: string;

  @ApiProperty({
    enum: VisitorCategory,
    example: VisitorCategory.FRIEND,
    description: 'Categoría del visitante',
  })
  @Expose()
  category: VisitorCategory;

  @ApiPropertyOptional({
    example: 'https://cdn.condofy.com/photos/visitor.jpg',
    description: 'Fotografía del visitante',
  })
  @Expose()
  photo?: string;
}

export class PublicPassHouseResponse {
  @ApiProperty({
    example: '102',
    description: 'Número de casa o departamento',
  })
  @Expose()
  houseNumber: string;

  @ApiPropertyOptional({
    example: 'Torre B',
    description: 'Torre o sección',
  })
  @Expose()
  tower?: string;
}

export class PublicPassCondominiumResponse {
  @ApiProperty({
    example: 'Residencial Los Pinos',
    description: 'Nombre del condominio o fraccionamiento',
  })
  @Expose()
  name: string;
}

export class PublicPassResponse {
  @ApiProperty({
    example: 'f5127271-9f93-410e-84b2-c0e86a01b22e',
    description: 'Identificador único del pase',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'ACC-0001',
    description: 'Código visual del pase de acceso',
  })
  @Expose()
  code: string;

  @ApiProperty({
    example: '648102',
    description:
      'PIN numérico de 6 dígitos para ingreso manual en caseta o teclado',
  })
  @Expose()
  pin: string;

  @ApiProperty({
    example: '648102',
    description: 'Código/Token para generación o lectura del código QR',
  })
  @Expose()
  qrCode: string;

  @ApiPropertyOptional({
    example: 'ABC-123-D',
    description: 'Placas vehiculares autorizadas para el acceso',
  })
  @Expose()
  vehiclePlate?: string;

  @ApiProperty({
    enum: AuthorizationType,
    example: AuthorizationType.ONE_TIME,
    description: 'Tipo de autorización: ONE_TIME, DATE_RANGE, PERMANENT',
  })
  @Expose()
  type: AuthorizationType;

  @ApiProperty({
    enum: AuthorizationStatus,
    example: AuthorizationStatus.ACTIVE,
    description: 'Estado actual: PENDING, ACTIVE, EXPIRED, CANCELLED, USED',
  })
  @Expose()
  status: AuthorizationStatus;

  @ApiProperty({
    example: false,
    description:
      'Indica si el visitante se encuentra actualmente dentro del condominio',
  })
  @Expose()
  insideCondo: boolean;

  @ApiProperty({
    example: '2026-09-11T18:00:00.000Z',
    description: 'Fecha y hora desde la cual es válido el acceso',
  })
  @Expose()
  validFrom: Date;

  @ApiPropertyOptional({
    example: '2026-09-11T23:59:59.000Z',
    description: 'Fecha y hora límite de validez del acceso',
  })
  @Expose()
  validUntil?: Date;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número máximo de entradas permitidas',
  })
  @Expose()
  maxEntries?: number;

  @ApiProperty({
    example: 0,
    description: 'Número de entradas ya utilizadas',
  })
  @Expose()
  usedEntries: number;

  @ApiPropertyOptional({
    example: 'Presentar identificación oficial en caseta principal',
    description: 'Instrucciones o notas para el visitante',
  })
  @Expose()
  notes?: string;

  @ApiPropertyOptional({
    type: () => PublicPassVisitorResponse,
    description: 'Datos del visitante',
  })
  @Expose()
  @Type(() => PublicPassVisitorResponse)
  visitor?: PublicPassVisitorResponse;

  @ApiPropertyOptional({
    type: () => PublicPassHouseResponse,
    description: 'Datos de la casa o departamento de destino',
  })
  @Expose()
  @Type(() => PublicPassHouseResponse)
  house?: PublicPassHouseResponse;

  @ApiPropertyOptional({
    type: () => PublicPassCondominiumResponse,
    description: 'Datos del condominio',
  })
  @Expose()
  @Type(() => PublicPassCondominiumResponse)
  condominium?: PublicPassCondominiumResponse;

  @ApiProperty({
    example: '2026-09-11T17:00:00.000Z',
    description: 'Fecha de creación del pase',
  })
  @Expose()
  createdAt: Date;
}
