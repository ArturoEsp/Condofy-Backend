import 'multer';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/billing.docs';
import { GetBillingSettingsUseCase } from '../../application/use-cases/get-billing-settings.usecase';
import { UpdateBillingSettingsUseCase } from '../../application/use-cases/update-billing-settings.usecase';
import { GetBillingRecordsUseCase } from '../../application/use-cases/get-billing-records.usecase';
import { RegisterPaymentUseCase } from '../../application/use-cases/register-payment.usecase';
import { UploadResidentProofUseCase } from '../../application/use-cases/upload-resident-proof.usecase';
import { ReviewResidentProofUseCase } from '../../application/use-cases/review-resident-proof.usecase';
import { GetMyBillingUseCase } from '../../application/use-cases/get-my-billing.usecase';
import { BillingNotificationService } from '../../infrastructure/services/billing-notification.service';

import { UpdateBillingSettingsRequest } from '../dtos/requests/update-billing-settings.request';
import { RegisterPaymentRequest } from '../dtos/requests/register-payment.request';
import { UploadResidentProofRequest } from '../dtos/requests/upload-resident-proof.request';
import { ReviewResidentProofRequest } from '../dtos/requests/review-resident-proof.request';
import { ParamsListBillingRequest } from '../dtos/requests/params-list-billing.request';

@ApiTags('Billing')
@Controller(':condominiumKey/billing')
export class BillingController {
  constructor(
    private readonly getBillingSettingsUseCase: GetBillingSettingsUseCase,
    private readonly updateBillingSettingsUseCase: UpdateBillingSettingsUseCase,
    private readonly getBillingRecordsUseCase: GetBillingRecordsUseCase,
    private readonly registerPaymentUseCase: RegisterPaymentUseCase,
    private readonly uploadResidentProofUseCase: UploadResidentProofUseCase,
    private readonly reviewResidentProofUseCase: ReviewResidentProofUseCase,
    private readonly getMyBillingUseCase: GetMyBillingUseCase,
    private readonly billingNotificationService: BillingNotificationService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  @Get('settings')
  @Roles('ADMIN', 'RESIDENT')
  @ApiEndpoint(docs.getSettings)
  async getSettings(@CondominiumId() condominiumId: string) {
    return await this.getBillingSettingsUseCase.execute(condominiumId);
  }

  @Put('settings')
  @Roles('ADMIN')
  @ApiEndpoint(docs.updateSettings)
  async updateSettings(
    @CondominiumId() condominiumId: string,
    @Body() data: UpdateBillingSettingsRequest,
  ) {
    return await this.updateBillingSettingsUseCase.execute(condominiumId, data);
  }

  @Get('records')
  @Roles('ADMIN')
  @ApiEndpoint(docs.getRecords)
  async getRecords(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListBillingRequest,
  ) {
    return await this.getBillingRecordsUseCase.execute(condominiumId, params);
  }

  @Get('export')
  @Roles('ADMIN')
  @ApiEndpoint(docs.exportBilling)
  async exportRecords(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListBillingRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const data = await this.getBillingRecordsUseCase.execute(
      condominiumId,
      params,
    );
    const fileName = `Reporte_Cobranza_${data.period}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const escape = (val: unknown) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).trim();
      if (
        str.includes(',') ||
        str.includes('"') ||
        str.includes('\n') ||
        str.includes('\r') ||
        str.includes(';')
      ) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return `"${str}"`;
    };

    const lines: string[] = [];
    const UTF8_BOM = '\uFEFF';

    lines.push(
      `${escape('CONDOFY - REPORTE DE COBRANZA Y BALANCE FINANCIERO')},,,,,,,,,,,,,,`,
    );
    lines.push(`${escape('Periodo:')},${escape(data.period)},,,,,,,,,,,,,`);
    lines.push(`,,,,,,,,,,,,,,`);

    const headers = [
      'Vivienda',
      'Torre',
      'Residente',
      'Email',
      'Cuota Base',
      'Recargo Mora',
      'Total a Pagar',
      'Monto Pagado',
      'Estatus',
      'Fecha de Pago',
      'Metodo de Pago',
      'Folio Recibo',
      'Referencia Transaccion',
      'Notas',
    ];
    lines.push(headers.map(escape).join(','));

    for (const r of data.records) {
      lines.push(
        [
          r.houseNumber,
          r.tower || 'Principal',
          r.residentName || 'Sin asignar',
          r.residentEmail || '',
          r.baseAmount.toFixed(2),
          r.lateFeeAmount.toFixed(2),
          r.totalAmount.toFixed(2),
          (r.paidAmount ?? (r.status === 'PAID' ? r.totalAmount : 0)).toFixed(
            2,
          ),
          r.status,
          r.paidDate ? new Date(r.paidDate).toISOString().split('T')[0] : 'N/A',
          r.paymentMethod || 'N/A',
          r.receipt?.folio || 'N/A',
          r.transactionReference || 'N/A',
          r.notes || '',
        ]
          .map(escape)
          .join(','),
      );
    }

    return UTF8_BOM + lines.join('\r\n');
  }

  @Post('payments')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('receiptFile'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.registerPayment)
  async registerPayment(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() data: RegisterPaymentRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let receiptUrl = data.receiptUrl;
    let receiptFileName = data.receiptFileName;

    if (file) {
      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'payments',
        fileName: file.originalname,
        referenceId: data.recordId,
      });

      const uploadResult = await this.storageService.uploadFile({
        file: {
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
          size: file.size,
        },
        path,
        isPublic: false,
        contentType: file.mimetype,
      });

      receiptUrl = uploadResult.key;
      receiptFileName = file.originalname;
    }

    return await this.registerPaymentUseCase.execute({
      recordId: data.recordId,
      condominiumId,
      userId: user.id,
      paidAmount: Number(data.paidAmount),
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      transactionReference: data.transactionReference,
      adminNotes: data.adminNotes,
      generateDigitalReceipt: data.generateDigitalReceipt,
      receiptUrl,
      receiptFileName,
      receiptFolio: data.receiptFolio,
    });
  }

  @Post('charges/:chargeId/proof')
  @Roles('RESIDENT')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.uploadResidentProof)
  async uploadResidentProof(
    @CondominiumId() condominiumId: string,
    @Param('chargeId') chargeId: string,
    @Body() data: UploadResidentProofRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let proofUrl = data.proofUrl;
    let proofFileName = data.fileName;

    if (file) {
      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'payments',
        fileName: file.originalname,
        referenceId: chargeId,
      });

      const uploadResult = await this.storageService.uploadFile({
        file: {
          buffer: file.buffer,
          mimetype: file.mimetype,
          originalname: file.originalname,
          size: file.size,
        },
        path,
        isPublic: false,
        contentType: file.mimetype,
      });

      proofUrl = uploadResult.key;
      proofFileName = file.originalname;
    }

    return await this.uploadResidentProofUseCase.execute({
      chargeId,
      condominiumId,
      proofUrl: proofUrl || '',
      proofFileName,
      transactionReference: data.transactionReference,
      notes: data.notes,
    });
  }

  @Patch('charges/:chargeId/review')
  @Roles('ADMIN')
  @ApiEndpoint(docs.reviewResidentProof)
  async reviewResidentProof(
    @CondominiumId() condominiumId: string,
    @Param('chargeId') chargeId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() data: ReviewResidentProofRequest,
  ) {
    return await this.reviewResidentProofUseCase.execute({
      chargeId,
      condominiumId,
      userId: user.id,
      action: data.action,
      reference: data.reference,
      rejectReason: data.rejectReason,
    });
  }

  @Get('my-records')
  @Roles('RESIDENT')
  @ApiEndpoint(docs.getMyBilling)
  async getMyBilling(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
  ) {
    return await this.getMyBillingUseCase.execute(user.id, condominiumId);
  }

  @Post('remind-pending')
  @Roles('ADMIN')
  @ApiEndpoint(docs.remindPending)
  async remindPending(
    @CondominiumId() condominiumId: string,
    @Query('period') period?: string,
  ) {
    return await this.billingNotificationService.sendManualReminderToPending(
      condominiumId,
      period,
    );
  }
}
