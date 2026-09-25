import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ParamsListExtraIncomeRequest {
  @ApiPropertyOptional({ example: '2026-09' })
  @IsString()
  @IsOptional()
  period?: string;

  @ApiPropertyOptional({ example: 'EVENT_HALL_RENTAL' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Salón' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-09-30' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'house-uuid' })
  @IsString()
  @IsOptional()
  houseId?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 50;
}
