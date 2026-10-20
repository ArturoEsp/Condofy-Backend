import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AmenityReservationType } from '@/core/infrastructure/persistence/prisma/generated/client';

export class UpdateAmenityRequest {
  @ApiPropertyOptional({
    description: 'Nombre de la amenidad (ej. Palapa Principal, Cancha de Tenis)',
    example: 'Palapa Principal Renovada',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la amenidad y facilidades incluidas',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Aforo o capacidad máxima permitida de personas',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Indica si la amenidad está activa y disponible para reservas',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Costo por reservación o evento (0 si es gratuita)',
    example: 600,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({
    description: 'Indica si se solicita depósito en garantía / fianza reembolsable',
  })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @ApiPropertyOptional({
    description: 'Monto del depósito en garantía',
    example: 1200,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  depositAmount?: number;

  @ApiPropertyOptional({
    description: 'URL del archivo PDF del reglamento subido',
  })
  @IsOptional()
  @IsString()
  rulesDocumentUrl?: string;

  @ApiPropertyOptional({
    description: 'Nombre original del archivo PDF del reglamento',
  })
  @IsOptional()
  @IsString()
  rulesDocumentName?: string;

  @ApiPropertyOptional({
    description: 'Texto o reglas resumidas en formato texto plano',
  })
  @IsOptional()
  @IsString()
  rulesText?: string;

  @ApiPropertyOptional({
    description: 'Lista de URLs de fotografías de la amenidad',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({
    enum: AmenityReservationType,
    description: 'Tipo de reservación (PER_DAY = día completo, PER_TIME_SLOT = por bloques/horas)',
  })
  @IsOptional()
  @IsEnum(AmenityReservationType)
  reservationType?: AmenityReservationType;

  @ApiPropertyOptional({
    description: 'Hora de apertura en formato HH:mm (ej. "08:00")',
  })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({
    description: 'Hora de cierre en formato HH:mm (ej. "22:00")',
  })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({
    description:
      'Días disponibles de la semana permitidos (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  availableDays?: number[];

  @ApiPropertyOptional({
    description: 'Horas mínimas de anticipación requeridas para solicitar la reservación',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minNoticeHours?: number;

  @ApiPropertyOptional({
    description: 'Días máximos a futuro con los que un residente puede apartar',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxNoticeDays?: number;

  @ApiPropertyOptional({
    description: 'Duración máxima en horas por reserva cuando el tipo es PER_TIME_SLOT',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxHoursPerReservation?: number;

  @ApiPropertyOptional({
    description: 'Indica si la solicitud requiere aprobación manual del administrador',
  })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}

