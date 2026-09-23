import BillingRepository from '../../domain/repositories/billing.repository';
import { RegisterPaymentCommand } from '../commands/register-payment.command';

export class RegisterPaymentUseCase {
  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(command: RegisterPaymentCommand) {
    return await this.billingRepository.registerPayment({
      chargeId: command.recordId,
      condominiumId: command.condominiumId,
      userId: command.userId,
      paidAmount: command.paidAmount,
      paymentDate: command.paymentDate,
      paymentMethod: command.paymentMethod,
      transactionReference: command.transactionReference,
      adminNotes: command.adminNotes,
      receiptUrl: command.receiptUrl,
      receiptFileName: command.receiptFileName,
      receiptFolio: command.receiptFolio,
    });
  }
}
