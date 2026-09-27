import { BillingRecordEntity } from './billing-record.entity';
import { AccountMovementEntity } from './account-movement.entity';
import { ExtraIncomeEntity } from './extra-income.entity';

export interface HouseStatementResidentInfo {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

export interface HouseStatementHouseInfo {
  id: string;
  houseNumber: string;
  tower?: string | null;
  resident?: HouseStatementResidentInfo | null;
}

export interface HouseStatementKpis {
  totalPaid: number;
  totalPendingDebt: number;
  creditBalance: number;
  punctualityRate: number; // Porcentaje 0 - 100
  totalRecords: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export class HouseStatementEntity {
  house: HouseStatementHouseInfo;
  kpis: HouseStatementKpis;
  charges: BillingRecordEntity[];
  movements: AccountMovementEntity[];
  extraIncomes: ExtraIncomeEntity[];
}
