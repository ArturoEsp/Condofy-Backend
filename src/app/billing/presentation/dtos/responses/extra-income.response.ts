import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ExtraIncomeEntity } from '../../../domain/entities/extra-income.entity';

export class ExtraIncomeResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

  @ApiPropertyOptional()
  @Expose()
  houseId?: string | null;

  @ApiPropertyOptional()
  @Expose()
  houseNumber?: string | null;

  @ApiPropertyOptional()
  @Expose()
  residentName?: string | null;

  @ApiProperty()
  @Expose()
  concept: string;

  @ApiPropertyOptional()
  @Expose()
  description?: string | null;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  incomeDate: Date;

  @ApiProperty()
  @Expose()
  period: string;

  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  paymentMethod: string;

  @ApiPropertyOptional()
  @Expose()
  reference?: string | null;

  @ApiPropertyOptional()
  @Expose()
  receiptUrl?: string | null;

  @ApiPropertyOptional()
  @Expose()
  receiptFileName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  receiptFileType?: string | null;

  @ApiPropertyOptional()
  @Expose()
  createdByName?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  static fromDomain(entity: ExtraIncomeEntity): ExtraIncomeResponse {
    const res = new ExtraIncomeResponse();
    res.id = entity.id;
    res.condominiumId = entity.condominiumId;
    res.houseId = entity.houseId;
    res.houseNumber = entity.houseNumber;
    res.residentName = entity.residentName;
    res.concept = entity.concept;
    res.description = entity.description;
    res.amount = entity.amount;
    res.incomeDate = entity.incomeDate;
    res.period = entity.period;
    res.category = entity.category;
    res.paymentMethod = entity.paymentMethod;
    res.reference = entity.reference;
    res.receiptUrl = entity.receiptUrl;
    res.receiptFileName = entity.receiptFileName;
    res.receiptFileType = entity.receiptFileType;
    res.createdByName = entity.createdByName;
    res.createdAt = entity.createdAt;
    return res;
  }
}

export class ExtraIncomesListResponse {
  @ApiPropertyOptional()
  @Expose()
  period?: string;

  @ApiProperty()
  @Expose()
  count: number;

  @ApiProperty()
  @Expose()
  totalAmount: number;

  @ApiProperty({ type: [ExtraIncomeResponse] })
  @Expose()
  records: ExtraIncomeResponse[];
}
