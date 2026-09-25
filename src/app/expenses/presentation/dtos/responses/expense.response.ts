import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseEntity } from '../../../domain/entities/expense.entity';

export class ExpenseResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  condominiumId: string;

  @ApiProperty()
  concept: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  expenseDate: string;

  @ApiProperty()
  period: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  paymentMethod: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  supplier?: string | null;

  @ApiPropertyOptional()
  reference?: string | null;

  @ApiPropertyOptional()
  invoiceUrl?: string | null;

  @ApiPropertyOptional()
  invoiceFileName?: string | null;

  @ApiPropertyOptional()
  invoiceFileType?: string | null;

  @ApiProperty()
  createdById: string;

  @ApiPropertyOptional()
  createdByName?: string | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
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
