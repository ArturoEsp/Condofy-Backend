import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BillingRecordResponse } from './billing-record.response';
import { ExtraIncomeResponse } from './extra-income.response';

export class HouseStatementResidentResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiPropertyOptional()
  @Expose()
  phone?: string | null;
}

export class HouseStatementHouseResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  houseNumber: string;

  @ApiPropertyOptional()
  @Expose()
  tower?: string | null;

  @ApiPropertyOptional({ type: () => HouseStatementResidentResponse })
  @Expose()
  @Type(() => HouseStatementResidentResponse)
  resident?: HouseStatementResidentResponse | null;
}

export class HouseStatementKpisResponse {
  @ApiProperty({ example: 25000 })
  @Expose()
  totalPaid: number;

  @ApiProperty({ example: 0 })
  @Expose()
  totalPendingDebt: number;

  @ApiProperty({ example: 1500 })
  @Expose()
  creditBalance: number;

  @ApiProperty({ example: 95 })
  @Expose()
  punctualityRate: number;

  @ApiProperty({ example: 12 })
  @Expose()
  totalRecords: number;

  @ApiProperty({ example: 11 })
  @Expose()
  paidCount: number;

  @ApiProperty({ example: 1 })
  @Expose()
  pendingCount: number;

  @ApiProperty({ example: 0 })
  @Expose()
  overdueCount: number;
}

export class AccountMovementResponse {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  houseId: string;

  @ApiProperty({ example: 'PAYMENT' })
  @Expose()
  type: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty({ example: 1500 })
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  movementDate: Date;

  @ApiProperty()
  @Expose()
  createdAt: Date;
}

export class HouseStatementResponse {
  @ApiProperty({ type: () => HouseStatementHouseResponse })
  @Expose()
  @Type(() => HouseStatementHouseResponse)
  house: HouseStatementHouseResponse;

  @ApiProperty({ type: () => HouseStatementKpisResponse })
  @Expose()
  @Type(() => HouseStatementKpisResponse)
  kpis: HouseStatementKpisResponse;

  @ApiProperty({ type: [BillingRecordResponse] })
  @Expose()
  @Type(() => BillingRecordResponse)
  charges: BillingRecordResponse[];

  @ApiProperty({ type: [AccountMovementResponse] })
  @Expose()
  @Type(() => AccountMovementResponse)
  movements: AccountMovementResponse[];

  @ApiProperty({ type: [ExtraIncomeResponse] })
  @Expose()
  @Type(() => ExtraIncomeResponse)
  extraIncomes: ExtraIncomeResponse[];
}
