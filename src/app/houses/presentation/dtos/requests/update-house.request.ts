import { UpdateHouseCommand } from '@/app/houses/application/commands/update-house.command';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHouseRequest implements UpdateHouseCommand {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  houseNumber: string;

  @ApiProperty()
  @IsString()
  tower: string;
}
