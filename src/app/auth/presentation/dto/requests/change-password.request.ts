import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordRequest {
  @ApiProperty({ description: 'Contraseña actual del usuario' })
  @IsString({ message: 'La contraseña actual debe ser texto' })
  @IsNotEmpty({ message: 'Debes ingresar tu contraseña actual' })
  @MinLength(6, {
    message: 'La contraseña actual debe tener al menos 6 caracteres',
  })
  currentPassword: string;

  @ApiProperty({ description: 'Nueva contraseña que se asignará' })
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @IsNotEmpty({ message: 'Debes ingresar una nueva contraseña' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword: string;
}
