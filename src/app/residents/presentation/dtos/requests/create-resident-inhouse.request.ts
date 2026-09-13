import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

import { ResidentType } from '@/core/infrastructure/persistence/prisma/generated/browser';
import { CreateResidentCommand } from '@/app/residents/application/commands/create-resident.command';

export class CreateResidentInHouseRequest implements Omit<
  CreateResidentCommand,
  'condominiumId'
> {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  phone: string | null;

  @ApiProperty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  houseId: string;

  @ApiProperty()
  @IsEnum(ResidentType)
  residentType: ResidentType;
}
