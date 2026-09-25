export class TransparencyConfigEntity {
  id: string;
  condominiumId: string;
  isEnabled: boolean;
  showExpenses: boolean;
  showIncomes: boolean;
  showBalance: boolean;
  showSuppliers: boolean;
  allowInvoiceViewing: boolean;
  allowInvoiceDownload: boolean;
  showCollectionRate: boolean;
  timeframeMode: string;
  condominiumNotice?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<TransparencyConfigEntity>) {
    Object.assign(this, partial);
  }
}
