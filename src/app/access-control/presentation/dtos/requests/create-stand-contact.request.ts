import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateStandContactRequest {
  @ApiProperty({ example: 'Caseta Principal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '55 1234 5678' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'Ext. 101' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  extension?: string;

  @ApiPropertyOptional({ example: '24/7' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  schedule?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  hasWhatsapp?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'Acceso vehicular y peatonal' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  notes?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
