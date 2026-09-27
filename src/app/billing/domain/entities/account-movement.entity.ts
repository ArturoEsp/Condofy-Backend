export class AccountMovementEntity {
  id: string;
  houseId: string;
  type: string;
  description: string;
  amount: number;
  movementDate: Date;
  createdAt: Date;
}
