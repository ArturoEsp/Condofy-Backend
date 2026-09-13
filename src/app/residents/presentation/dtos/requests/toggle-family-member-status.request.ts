import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ToggleFamilyMemberStatusRequest {
  @ApiProperty({
    description:
      'Estado de la cuenta: true para activar, false para desactivar',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
