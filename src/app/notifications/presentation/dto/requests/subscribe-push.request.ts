import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class PushSubscriptionKeysRequest {
  @ApiProperty({ description: 'Clave p256dh de la suscripción' })
  @IsString()
  @IsNotEmpty()
  p256dh: string;

  @ApiProperty({ description: 'Clave auth de la suscripción' })
  @IsString()
  @IsNotEmpty()
  auth: string;
}

export class SubscribePushRequest {
  @ApiProperty({
    description: 'Endpoint único del servicio push de Google/Apple',
  })
  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @ApiPropertyOptional({ description: 'Tiempo de expiración si aplica' })
  @IsNumber()
  @IsOptional()
  expirationTime?: number | null;

  @ApiProperty({ type: PushSubscriptionKeysRequest })
  @IsObject()
  @ValidateNested()
  @Type(() => PushSubscriptionKeysRequest)
  keys: PushSubscriptionKeysRequest;
}
