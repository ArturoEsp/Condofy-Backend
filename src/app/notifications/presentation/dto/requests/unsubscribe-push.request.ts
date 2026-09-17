import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UnsubscribePushRequest {
  @ApiProperty({ description: 'Endpoint de la suscripción a desregistrar' })
  @IsString()
  @IsNotEmpty()
  endpoint: string;
}
