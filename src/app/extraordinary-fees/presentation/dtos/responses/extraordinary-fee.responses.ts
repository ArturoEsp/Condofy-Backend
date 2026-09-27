import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ExtraordinaryFeeDocumentResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  extraordinaryFeeId: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  fileName: string;

  @ApiProperty()
  @Expose()
  fileUrl: string;

  @ApiPropertyOptional()
  @Expose()
  fileType?: string | null;

  @ApiPropertyOptional()
  @Expose()
  fileSize?: string | null;

  @ApiProperty()
  @Expose()
  uploadedAt: Date;
}

export class ExtraordinaryFeeChargeResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  extraordinaryFeeId: string;

  @ApiProperty()
  @Expose()
  houseId: string;

  @ApiProperty()
  @Expose()
  houseNumber: string;

  @ApiPropertyOptional()
  @Expose()
  tower?: string | null;

  @ApiPropertyOptional()
  @Expose()
  residentName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  residentEmail?: string | null;

  @ApiPropertyOptional()
  @Expose()
  residentPhone?: string | null;

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  paidAmount: number;

  @ApiProperty({
    enum: ['PENDING', 'IN_REVIEW', 'PARTIAL', 'PAID', 'CANCELLED'],
  })
  @Expose()
  status: string;

  @ApiPropertyOptional()
  @Expose()
  paymentDate?: Date | null;

  @ApiPropertyOptional()
  @Expose()
  paymentMethod?: string | null;

  @ApiPropertyOptional()
  @Expose()
  reference?: string | null;

  @ApiPropertyOptional()
  @Expose()
  notes?: string | null;

  @ApiPropertyOptional()
  @Expose()
  proofUrl?: string | null;

  @ApiPropertyOptional()
  @Expose()
  proofFileName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  proofUploadedAt?: Date | null;

  @ApiPropertyOptional()
  @Expose()
  receiptFolio?: string | null;

  @ApiPropertyOptional()
  @Expose()
  receiptUrl?: string | null;

  @ApiPropertyOptional()
  @Expose()
  receiptUploadedAt?: Date | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

export class ExtraordinaryFeeKpisResponse {
  @ApiProperty({ example: 72000 })
  @Expose()
  totalTarget: number;

  @ApiProperty({ example: 45000 })
  @Expose()
  totalCollected: number;

  @ApiProperty({ example: 62.5 })
  @Expose()
  progressPercentage: number;

  @ApiProperty({ example: 40 })
  @Expose()
  totalHouses: number;

  @ApiProperty({ example: 25 })
  @Expose()
  paidHousesCount: number;

  @ApiProperty({ example: 14 })
  @Expose()
  pendingHousesCount: number;

  @ApiProperty({ example: 1 })
  @Expose()
  inReviewHousesCount: number;
}

export class ExtraordinaryFeeResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  condominiumId: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  amountPerHouse: number;

  @ApiPropertyOptional()
  @Expose()
  totalTargetAmount?: number | null;

  @ApiProperty()
  @Expose()
  dueDate: Date;

  @ApiProperty({ enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'] })
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  useCustomBankAccount: boolean;

  @ApiPropertyOptional()
  @Expose()
  bankName?: string | null;

  @ApiPropertyOptional()
  @Expose()
  accountHolder?: string | null;

  @ApiPropertyOptional()
  @Expose()
  clabe?: string | null;

  @ApiPropertyOptional()
  @Expose()
  accountNumber?: string | null;

  @ApiPropertyOptional()
  @Expose()
  paymentReferenceRule?: string | null;

  @ApiProperty()
  @Expose()
  createdById: string;

  @ApiPropertyOptional()
  @Expose()
  createdByName?: string | null;

  @ApiProperty({ type: [ExtraordinaryFeeDocumentResponse] })
  @Expose()
  @Type(() => ExtraordinaryFeeDocumentResponse)
  documents: ExtraordinaryFeeDocumentResponse[];

  @ApiPropertyOptional({ type: [ExtraordinaryFeeChargeResponse] })
  @Expose()
  @Type(() => ExtraordinaryFeeChargeResponse)
  charges?: ExtraordinaryFeeChargeResponse[];

  @ApiPropertyOptional({ type: () => ExtraordinaryFeeKpisResponse })
  @Expose()
  @Type(() => ExtraordinaryFeeKpisResponse)
  kpis?: ExtraordinaryFeeKpisResponse;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
