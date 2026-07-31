import { ParamsListResidentsCommand } from '@/app/residents/application/commands/params-list-residents.command';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class ParamsListResidentRequest implements ParamsListResidentsCommand {
  @ApiProperty()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  page: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  size: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  orderBy?: 'asc' | 'desc';
}
