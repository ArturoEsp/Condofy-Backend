import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  GeneralProviderCategory,
  GeneralProviderStatus,
} from '@/core/infrastructure/persistence/prisma/generated/enums';

export class GeneralProviderGuardResponse {
  @ApiProperty({ example: 'usr-123' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'guardia@condofy.com' })
  @Expose()
  email: string;

  @ApiPropertyOptional({ example: 'Juan' })
  @Expose()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Pérez' })
  @Expose()
  lastName?: string;
}

export class GeneralProviderResponse {
  @ApiProperty({ example: 'f5127271-9f93-410e-84b2-c0e86a01b22e' })
  @Expose()
  id: string;

  @ApiProperty({ example: 'Agua Ciel' })
  @Expose()
  name: string;

  @ApiProperty({
    enum: GeneralProviderCategory,
    example: GeneralProviderCategory.WATER,
  })
  @Expose()
  category: GeneralProviderCategory;

  @ApiPropertyOptional({ example: 'Carlos Martínez' })
  @Expose()
  driverName?: string;

  @ApiPropertyOptional({ example: 'ABC-123-D' })
  @Expose()
  vehiclePlate?: string;

  @ApiPropertyOptional({ example: '+525512345678' })
  @Expose()
  companyPhone?: string;

  @ApiPropertyOptional({ example: 'Repartidor de garrafones' })
  @Expose()
  notes?: string;

  @ApiProperty({
    enum: GeneralProviderStatus,
    example: GeneralProviderStatus.INSIDE,
  })
  @Expose()
  status: GeneralProviderStatus;

  @ApiProperty({ example: '2026-09-19T10:30:00.000Z' })
  @Expose()
  enteredAt: Date;

  @ApiProperty({ example: 'usr-guard-1' })
  @Expose()
  entryGuardId: string;

  @ApiPropertyOptional({ type: () => GeneralProviderGuardResponse })
  @Expose()
  @Type(() => GeneralProviderGuardResponse)
  entryGuard?: GeneralProviderGuardResponse;

  @ApiPropertyOptional({ example: '2026-09-19T11:15:00.000Z' })
  @Expose()
  exitedAt?: Date;

  @ApiPropertyOptional({ example: 'usr-guard-2' })
  @Expose()
  exitGuardId?: string;

  @ApiPropertyOptional({ type: () => GeneralProviderGuardResponse })
  @Expose()
  @Type(() => GeneralProviderGuardResponse)
  exitGuard?: GeneralProviderGuardResponse;

  @ApiPropertyOptional({ example: 'Concluyó reparto sin incidentes' })
  @Expose()
  exitNotes?: string;

  @ApiProperty({ example: '2026-09-19T10:30:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2026-09-19T11:15:00.000Z' })
  @Expose()
  updatedAt: Date;
}

export class GeneralProviderListResponse {
  @ApiProperty({ type: [GeneralProviderResponse] })
  @Expose()
  @Type(() => GeneralProviderResponse)
  providers: GeneralProviderResponse[];

  @ApiProperty({ example: 10 })
  @Expose()
  total: number;

  @ApiProperty({ example: 1 })
  @Expose()
  page: number;

  @ApiProperty({ example: 15 })
  @Expose()
  size: number;

  @ApiProperty({ example: 1 })
  @Expose()
  totalPages: number;
}

export class RegisterGeneralProviderResultResponse {
  @ApiProperty({ type: () => GeneralProviderResponse })
  @Expose()
  @Type(() => GeneralProviderResponse)
  provider: GeneralProviderResponse;

  @ApiProperty({ example: 45 })
  @Expose()
  notifiedResidentsCount: number;

  @ApiProperty({
    example: '*Aviso de Caseta:* Ha ingresado el proveedor *Agua Ciel*...',
  })
  @Expose()
  whatsappMessage: string;
}

export class ExitGeneralProviderResultResponse {
  @ApiProperty({ type: () => GeneralProviderResponse })
  @Expose()
  @Type(() => GeneralProviderResponse)
  provider: GeneralProviderResponse;

  @ApiProperty({ example: 45 })
  @Expose()
  notifiedResidentsCount: number;

  @ApiProperty({
    example: '*Aviso de Caseta:* El proveedor *Agua Ciel* ha concluido...',
  })
  @Expose()
  whatsappMessage: string;
}
