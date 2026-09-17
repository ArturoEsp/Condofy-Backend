import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AdminUpdateResidentPasswordRequest {
  @ApiProperty({
    description: 'Nueva contraseña que el administrador asignará al residente',
    minLength: 6,
    example: 'ClaveSegura2026!',
  })
  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @IsNotEmpty({ message: 'Debes ingresar una nueva contraseña' })
  @MinLength(6, {
    message: 'La nueva contraseña debe tener al menos 6 caracteres',
  })
  newPassword: string;
}
