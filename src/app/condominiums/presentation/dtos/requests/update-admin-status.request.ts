import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UpdateAdminStatusRequest {
  @ApiProperty({
    enum: UserStatus,
    description: 'Nuevo estado del usuario administrador',
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus, { message: 'El estado proporcionado no es válido' })
  @IsNotEmpty({ message: 'El estado es requerido' })
  status: UserStatus;
}
