import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class ParamsGetCalendarRequest {
  @ApiProperty({
    description: 'Fecha de inicio del rango a consultar (ISO string)',
    example: '2026-11-01T00:00:00.000Z',
  })
  @IsNotEmpty({ message: 'La fecha inicial es obligatoria' })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del rango a consultar (ISO string)',
    example: '2026-11-30T23:59:59.000Z',
  })
  @IsNotEmpty({ message: 'La fecha final es obligatoria' })
  @IsDateString()
  endDate: string;
}
