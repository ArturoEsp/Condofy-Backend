import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  AuthorizationStatus,
  AuthorizationType,
  EntryType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';
import { VisitorResponse } from './visitor.response';

export class AccessLogSummaryResponse {
  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador del registro de acceso',
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: EntryType,
    example: EntryType.ENTRY,
    description: 'Tipo de movimiento registrado: ENTRY o EXIT',
  })
  @Expose()
  entryType: EntryType;

  @ApiProperty({
    example: '2026-09-11T18:30:00.000Z',
    description: 'Fecha y hora del registro de acceso',
  })
  @Expose()
  date: Date;

  @ApiPropertyOptional({
    example: 'Acceso vehicular autorizado por caseta principal',
    description: 'Observaciones del guardia al registrar el acceso',
  })
  @Expose()
  observations?: string;
}

export class AccessAuthorizationResponse {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Identificador único de la autorización',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 1,
    description: 'Número de secuencia autonumérico',
  })
  @Expose()
  index: number;

  @ApiProperty({
    example: 'ACC-0001',
    description: 'Código visual de registro formateado con 4 dígitos',
  })
  @Expose()
  code: string;

  @ApiProperty({
    example: '849201',
    description: 'PIN numérico de 6 dígitos para ingreso manual o teclado',
  })
  @Expose()
  pin: string;

  @ApiProperty({
    example: '849201',
    description: 'Código/Token para generación o lectura del código QR',
  })
  @Expose()
  qrCode: string;

  @ApiPropertyOptional({
    example: 'ABC-123-D',
    description: 'Placas vehiculares asociadas al acceso',
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
    description: 'Estado: PENDING, ACTIVE, EXPIRED, CANCELLED, USED',
  })
  @Expose()
  status: AuthorizationStatus;

  @ApiProperty({
    example: true,
    description:
      'Indica si el visitante se encuentra actualmente dentro del condominio (Check-in activo)',
  })
  @Expose()
  insideCondo: boolean;

  @ApiPropertyOptional({
    type: () => AccessLogSummaryResponse,
    description: 'Último registro de entrada o salida efectuado',
  })
  @Expose()
  @Type(() => AccessLogSummaryResponse)
  lastLog?: AccessLogSummaryResponse;

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
    example: 'Llega en Uber color gris',
    description: 'Notas o comentarios sobre el acceso',
  })
  @Expose()
  notes?: string;

  @ApiPropertyOptional({
    type: () => VisitorResponse,
    description: 'Datos del visitante asociado',
  })
  @Expose()
  @Type(() => VisitorResponse)
  visitor?: VisitorResponse;

  @ApiProperty({
    example: '2026-09-11T17:00:00.000Z',
    description: 'Fecha de creación',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2026-09-11T17:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  @Expose()
  updatedAt: Date;
}
