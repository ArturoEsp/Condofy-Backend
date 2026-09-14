import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateGuardRequest {
  @ApiProperty({
    example: 'guardia.norte@condofy.com',
    description: 'Correo electrónico para acceso de la caseta / guardia',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'guardia1234',
    description: 'Contraseña de acceso para el guardia',
  })
  @IsString()
  @MinLength(6)
  password: string;
}
