import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateHouseRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  houseNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tower: string | null;
}
