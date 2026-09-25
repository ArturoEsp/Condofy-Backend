import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExtraIncomeRequest {
  @ApiPropertyOptional({ example: 'house-uuid-123' })
  @IsString()
  @IsOptional()
  houseId?: string;

  @ApiProperty({ example: 'Renta del Salón de Usos Múltiples' })
  @IsString()
  concept: string;

  @ApiPropertyOptional({ example: 'Evento de cumpleaños de 14:00 a 20:00' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1500.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: '2026-09-24T18:00:00.000Z' })
  @IsString()
  incomeDate: string;

  @ApiPropertyOptional({ example: '2026-09' })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiProperty({
    enum: [
      'EVENT_HALL_RENTAL',
      'TAG_RFID',
      'PENALTY_FEE',
      'INTEREST',
      'AMENITY_ACCESS',
      'DONATION',
      'OTHER',
    ],
    example: 'EVENT_HALL_RENTAL',
  })
  @IsString()
  category: string;

  @ApiProperty({
    enum: ['TRANSFER', 'CASH', 'SPEI', 'CARD', 'CHECK'],
    example: 'TRANSFER',
  })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ example: 'REF-789012' })
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiPropertyOptional({ example: 'https://example.com/recibo.pdf' })
  @IsString()
  @IsOptional()
  receiptUrl?: string;

  @ApiPropertyOptional({ example: 'recibo_salon.pdf' })
  @IsString()
  @IsOptional()
  receiptFileName?: string;
}
