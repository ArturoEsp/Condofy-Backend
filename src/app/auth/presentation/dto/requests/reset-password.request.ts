import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordRequest {
  @ApiProperty({
    description: 'Token de restablecimiento de contraseña de un solo uso',
    example: 'a4b8c9d0e1f2...',
  })
  @IsString({ message: 'El token debe ser texto' })
  @IsNotEmpty({ message: 'El token es requerido' })
  token: string;

  @ApiProperty({
    description: 'Nueva contraseña que se asignará a la cuenta',
    minLength: 6,
    example: 'NuevaClaveSegura123!',
  })
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @IsNotEmpty({ message: 'Debes ingresar una nueva contraseña' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword: string;
}
