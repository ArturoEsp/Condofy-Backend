import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ExpenseEntity } from '../../../domain/entities/expense.entity';

export class ExpenseResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

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
  expenseDate: string;

  @ApiProperty()
  @Expose()
  period: string;

  @ApiProperty()
  @Expose()
  category: string;

  @ApiProperty()
  @Expose()
  paymentMethod: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiPropertyOptional()
  @Expose()
  supplier?: string | null;

  @ApiPropertyOptional()
  @Expose()
  reference?: string | null;

  @ApiPropertyOptional()
  @Expose()
  invoiceUrl?: string | null;

  @ApiPropertyOptional()
  @Expose()
  invoiceFileName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  invoiceFileType?: string | null;

  @ApiProperty()
  @Expose()
  createdById: string;

  @ApiPropertyOptional()
  @Expose()
  createdByName?: string | null;

  @ApiProperty()
  @Expose()
  createdAt: string;

  @ApiProperty()
  @Expose()
  updatedAt: string;

  static fromDomain(entity: ExpenseEntity): ExpenseResponse {
    const res = new ExpenseResponse();
    res.id = entity.id;
    res.condominiumId = entity.condominiumId;
    res.concept = entity.concept;
    res.description = entity.description;
    res.amount = entity.amount;
    res.expenseDate =
      entity.expenseDate instanceof Date
        ? entity.expenseDate.toISOString().split('T')[0]
        : String(entity.expenseDate).split('T')[0];
    res.period = entity.period;
    res.category = entity.category;
    res.paymentMethod = entity.paymentMethod;
    res.status = entity.status;
    res.supplier = entity.supplier;
    res.reference = entity.reference;
    res.invoiceUrl = entity.invoiceUrl;
    res.invoiceFileName = entity.invoiceFileName;
    res.invoiceFileType = entity.invoiceFileType;
    res.createdById = entity.createdById;
    res.createdByName = entity.createdByName;
    res.createdAt =
      entity.createdAt instanceof Date
        ? entity.createdAt.toISOString()
        : String(entity.createdAt);
    res.updatedAt =
      entity.updatedAt instanceof Date
        ? entity.updatedAt.toISOString()
        : String(entity.updatedAt);
    return res;
  }
}
