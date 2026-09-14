import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

export class UpdateGuardStatusRequest {
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.ACTIVE,
    description: 'Nuevo estado del guardia: ACTIVE, SUSPENDED, INACTIVE',
  })
  @IsEnum(UserStatus)
  @IsNotEmpty()
  status: UserStatus;
}
