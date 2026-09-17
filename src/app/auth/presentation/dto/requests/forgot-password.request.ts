import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequest {
  @ApiProperty({
    description: 'Correo electrónico registrado de la cuenta',
    example: 'residente@condofy.com',
  })
  @IsEmail({}, { message: 'El formato del correo electrónico es inválido' })
  @IsString({ message: 'El correo electrónico debe ser texto' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;
}
