export type ExtraIncomeCategoryDomain =
  | 'EVENT_HALL_RENTAL'
  | 'TAG_RFID'
  | 'PENALTY_FEE'
  | 'INTEREST'
  | 'AMENITY_ACCESS'
  | 'DONATION'
  | 'OTHER'
  | string;

export class ExtraIncomeEntity {
  id: string;
  condominiumId: string;
  houseId?: string | null;
  houseNumber?: string | null;
  residentName?: string | null;
  concept: string;
  description?: string | null;
  amount: number;
  incomeDate: Date;
  period: string;
  category: string;
  paymentMethod: string;
  reference?: string | null;
  receiptUrl?: string | null;
  receiptFileName?: string | null;
  receiptFileType?: string | null;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<ExtraIncomeEntity>) {
    Object.assign(this, partial);
  }
}
