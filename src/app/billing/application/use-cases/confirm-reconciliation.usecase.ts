import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import BillingRepository from '../../domain/repositories/billing.repository';

export interface ConfirmReconciledPaymentItem {
  chargeId: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod?: string;
  transactionReference?: string;
  adminNotes?: string;
  generateDigitalReceipt?: boolean;
}

export interface ConfirmReconciliationCommand {
  condominiumId: string;
  userId: string;
  payments: ConfirmReconciledPaymentItem[];
}

export interface ConfirmReconciliationResult {
  totalProcessed: number;
  totalSuccess: number;
  totalFailed: number;
  results: Array<{
    chargeId: string;
    success: boolean;
    error?: string;
    paidAmount?: number;
  }>;
}

@Injectable()
export class ConfirmReconciliationUseCase {
  private readonly logger = new Logger(ConfirmReconciliationUseCase.name);

  constructor(private readonly billingRepository: BillingRepository) {}

  async execute(
    command: ConfirmReconciliationCommand,
  ): Promise<ConfirmReconciliationResult> {
    const { condominiumId, userId, payments } = command;

    if (!payments || payments.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un pago para confirmar la conciliación.',
      );
    }

    this.logger.log(
      `Confirmando conciliación de ${payments.length} pagos para el condominio ${condominiumId} por usuario ${userId}`,
    );

    const results: Array<{
      chargeId: string;
      success: boolean;
      error?: string;
      paidAmount?: number;
    }> = [];

    let totalSuccess = 0;
    let totalFailed = 0;

    for (const item of payments) {
      try {
        const paymentDate = item.paymentDate
          ? new Date(item.paymentDate)
          : new Date();

        await this.billingRepository.registerPayment({
          chargeId: item.chargeId,
          condominiumId: condominiumId,
          userId: userId,
          paidAmount: Number(item.paidAmount),
          paymentDate: isNaN(paymentDate.getTime()) ? new Date() : paymentDate,
          paymentMethod: item.paymentMethod || 'SPEI',
          transactionReference: item.transactionReference || 'CONCILIACION_IA',
          adminNotes:
            item.adminNotes ||
            'Pago registrado mediante conciliación de estado de cuenta bancario',
        });

        totalSuccess++;
        results.push({
          chargeId: item.chargeId,
          success: true,
          paidAmount: Number(item.paidAmount),
        });
      } catch (error) {
        totalFailed++;
        const err = error as Error;
        const errorMessage = err?.message || 'Error registrando el pago';
        this.logger.error(
          `Error registrando pago para el cargo ${item.chargeId}: ${errorMessage}`,
        );
        results.push({
          chargeId: item.chargeId,
          success: false,
          error: errorMessage,
          paidAmount: Number(item.paidAmount),
        });
      }
    }

    return {
      totalProcessed: payments.length,
      totalSuccess,
      totalFailed,
      results,
    };
  }
}
