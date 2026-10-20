import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AmenityReservationType } from '@/core/infrastructure/persistence/prisma/generated/client';

export class CreateAmenityRequest {
  @ApiProperty({
    description:
      'Nombre de la amenidad (ej. Palapa Principal, Cancha de Tenis)',
    example: 'Palapa Principal',
  })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada de la amenidad y facilidades incluidas',
    example: 'Incluye asador, mesas para 40 personas, sanitarios y tarja.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Aforo o capacidad máxima permitida de personas',
    example: 50,
  })
  @IsOptional()
  @IsInt({ message: 'La capacidad debe ser un número entero' })
  @Min(1, { message: 'La capacidad debe ser de al menos 1 persona' })
  @Type(() => Number)
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Indica si la amenidad está activa y disponible para reservas',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Costo por reservación o evento (0 si es gratuita)',
    default: 0,
    example: 500,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El costo debe ser un número válido' })
  @Min(0, { message: 'El costo no puede ser negativo' })
  @Type(() => Number)
  cost?: number;

  @ApiPropertyOptional({
    description:
      'Indica si se solicita depósito en garantía / fianza reembolsable',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;

  @ApiPropertyOptional({
    description: 'Monto del depósito en garantía',
    example: 1000,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El depósito debe ser un número válido' })
  @Min(0, { message: 'El depósito no puede ser negativo' })
  @Type(() => Number)
  depositAmount?: number;

  @ApiPropertyOptional({
    description: 'URL del archivo PDF del reglamento subido',
    example: 'https://...',
  })
  @IsOptional()
  @IsString()
  rulesDocumentUrl?: string;

  @ApiPropertyOptional({
    description: 'Nombre original del archivo PDF del reglamento',
    example: 'Reglamento_Palapa_2026.pdf',
  })
  @IsOptional()
  @IsString()
  rulesDocumentName?: string;

  @ApiPropertyOptional({
    description: 'Texto o reglas resumidas en formato texto plano',
    example: '1. No música después de las 22:00 hrs. 2. Dejar limpia el área.',
  })
  @IsOptional()
  @IsString()
  rulesText?: string;

  @ApiPropertyOptional({
    description: 'Lista de URLs de fotografías de la amenidad',
    type: [String],
    example: ['https://storage.condofy.com/photo1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiPropertyOptional({
    enum: AmenityReservationType,
    description:
      'Tipo de reservación (PER_DAY = día completo, PER_TIME_SLOT = por bloques/horas)',
    default: AmenityReservationType.PER_DAY,
  })
  @IsOptional()
  @IsEnum(AmenityReservationType, {
    message: 'El tipo de reservación debe ser PER_DAY o PER_TIME_SLOT',
  })
  reservationType?: AmenityReservationType;

  @ApiPropertyOptional({
    description: 'Hora de apertura en formato HH:mm (ej. "08:00")',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({
    description: 'Hora de cierre en formato HH:mm (ej. "22:00")',
    example: '22:00',
  })
  @IsOptional()
  @IsString()
  closingTime?: string;

  @ApiPropertyOptional({
    description:
      'Días disponibles de la semana permitidos (0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado)',
    type: [Number],
    example: [1, 2, 3, 4, 5, 6, 0],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  availableDays?: number[];

  @ApiPropertyOptional({
    description:
      'Horas mínimas de anticipación requeridas para solicitar la reservación',
    default: 24,
    example: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minNoticeHours?: number;

  @ApiPropertyOptional({
    description: 'Días máximos a futuro con los que un residente puede apartar',
    default: 30,
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxNoticeDays?: number;

  @ApiPropertyOptional({
    description:
      'Duración máxima en horas por reserva cuando el tipo es PER_TIME_SLOT',
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maxHoursPerReservation?: number;

  @ApiPropertyOptional({
    description:
      'Indica si la solicitud requiere aprobación manual del administrador',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;
}
