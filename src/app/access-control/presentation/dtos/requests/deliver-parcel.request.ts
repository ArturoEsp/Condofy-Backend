import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class DeliverParcelRequest {
  @ApiProperty({
    description: 'Código PIN de 4 dígitos proporcionado por el residente',
    example: '8492',
  })
  @IsString()
  @IsNotEmpty()
  pickupCode: string;

  @ApiProperty({
    description: 'Nombre de la persona que retira físicamente el paquete',
    example: 'Laura Gómez (Titular)',
  })
  @IsString()
  @IsNotEmpty()
  deliveredToName: string;

  @ApiPropertyOptional({
    description: 'Notas u observaciones adicionales al momento de la entrega',
    example: 'Se entregó en mano propia.',
  })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}
