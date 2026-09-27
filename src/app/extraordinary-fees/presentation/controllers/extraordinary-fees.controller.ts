import 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { CondominiumId } from '@/common/decorators/condominium.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import { AuthUserEntity } from '@/app/auth/domain/entities/auth-user.entity';

import * as docs from '../docs/extraordinary-fees.docs';
import { CreateExtraordinaryFeeUseCase } from '../../application/use-cases/create-extraordinary-fee.usecase';
import { GetExtraordinaryFeesUseCase } from '../../application/use-cases/get-extraordinary-fees.usecase';
import { GetExtraordinaryFeeByIdUseCase } from '../../application/use-cases/get-extraordinary-fee-by-id.usecase';
import {
  DeleteExtraordinaryFeeUseCase,
  GetMyExtraordinaryFeeChargesUseCase,
  RegisterExtraordinaryFeePaymentUseCase,
  ReviewExtraordinaryFeeProofUseCase,
  UpdateExtraordinaryFeeStatusUseCase,
  UploadExtraordinaryFeeProofUseCase,
} from '../../application/use-cases/extraordinary-fee-operations.usecase';

import {
  CreateExtraordinaryFeeRequest,
  RegisterExtraordinaryFeePaymentRequest,
  ReviewExtraordinaryFeeProofRequest,
  UploadExtraordinaryFeeProofRequest,
} from '../dtos/requests/extraordinary-fee.requests';
import { CreateFeeDocumentData } from '../../domain/repositories/extraordinary-fee.repository';

@ApiTags('Extraordinary Fees')
@Controller(':condominiumKey/extraordinary-fees')
export class ExtraordinaryFeesController {
  constructor(
    private readonly createExtraordinaryFeeUseCase: CreateExtraordinaryFeeUseCase,
    private readonly getExtraordinaryFeesUseCase: GetExtraordinaryFeesUseCase,
    private readonly getExtraordinaryFeeByIdUseCase: GetExtraordinaryFeeByIdUseCase,
    private readonly updateExtraordinaryFeeStatusUseCase: UpdateExtraordinaryFeeStatusUseCase,
    private readonly deleteExtraordinaryFeeUseCase: DeleteExtraordinaryFeeUseCase,
    private readonly registerExtraordinaryFeePaymentUseCase: RegisterExtraordinaryFeePaymentUseCase,
    private readonly uploadExtraordinaryFeeProofUseCase: UploadExtraordinaryFeeProofUseCase,
    private readonly reviewExtraordinaryFeeProofUseCase: ReviewExtraordinaryFeeProofUseCase,
    private readonly getMyExtraordinaryFeeChargesUseCase: GetMyExtraordinaryFeeChargesUseCase,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FilesInterceptor('documentFiles', 10))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.createFee)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() data: CreateExtraordinaryFeeRequest,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const uploadedDocuments: CreateFeeDocumentData[] = [];

    if (files && files.length > 0) {
      const titles = Array.isArray(data.documentTitles)
        ? data.documentTitles
        : data.documentTitles
          ? [data.documentTitles]
          : [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const title = titles[i]?.trim() || file.originalname;

        const path = this.storageService.buildStoragePath({
          condominiumId,
          module: 'extraordinary-fees',
          fileName: file.originalname,
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

        const isPdf =
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf');

        const fileSizeFormatted =
          file.size > 1024 * 1024
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(file.size / 1024)} KB`;

        uploadedDocuments.push({
          title,
          fileName: file.originalname,
          fileUrl: uploadResult.key,
          fileType: isPdf ? 'pdf' : 'image',
          fileSize: fileSizeFormatted,
        });
      }
    }

    return await this.createExtraordinaryFeeUseCase.execute({
      condominiumId,
      createdById: user.id,
      title: data.title,
      description: data.description,
      amountPerHouse: Number(data.amountPerHouse),
      totalTargetAmount: data.totalTargetAmount
        ? Number(data.totalTargetAmount)
        : undefined,
      dueDate: new Date(data.dueDate),
      useCustomBankAccount: Boolean(data.useCustomBankAccount),
      bankName: data.bankName,
      accountHolder: data.accountHolder,
      clabe: data.clabe,
      accountNumber: data.accountNumber,
      paymentReferenceRule: data.paymentReferenceRule,
      documents: uploadedDocuments,
    });
  }

  @Get()
  @Roles('ADMIN')
  @ApiEndpoint(docs.getFees)
  async findAll(
    @CondominiumId() condominiumId: string,
    @Query('status') status?: string,
  ) {
    return await this.getExtraordinaryFeesUseCase.execute(
      condominiumId,
      status,
    );
  }

  @Get('my/charges')
  @Roles('RESIDENT', 'ADMIN')
  @ApiEndpoint(docs.getMyCharges)
  async getMyCharges(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
  ) {
    return await this.getMyExtraordinaryFeeChargesUseCase.execute(
      user.id,
      condominiumId,
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'RESIDENT')
  @ApiEndpoint(docs.getFeeById)
  async findById(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ) {
    return await this.getExtraordinaryFeeByIdUseCase.execute(id, condominiumId);
  }

  @Patch(':id/status')
  @Roles('ADMIN')
  @ApiEndpoint(docs.updateFeeStatus)
  async updateStatus(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body('status') status: any,
  ) {
    return await this.updateExtraordinaryFeeStatusUseCase.execute(
      id,
      condominiumId,
      status,
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiEndpoint(docs.deleteFee)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ) {
    return await this.deleteExtraordinaryFeeUseCase.execute(id, condominiumId);
  }

  @Post('charges/:chargeId/payment')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('receiptFile'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.registerPayment)
  async registerPayment(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('chargeId') chargeId: string,
    @Body() data: RegisterExtraordinaryFeePaymentRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let receiptUrl = data.receiptUrl;
    let receiptFileName = data.receiptFileName;

    if (file) {
      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'extraordinary-fees-receipts',
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

      receiptUrl = uploadResult.key;
      receiptFileName = file.originalname;
    }

    return await this.registerExtraordinaryFeePaymentUseCase.execute({
      chargeId,
      condominiumId,
      userId: user.id,
      paidAmount: Number(data.paidAmount),
      paymentDate: new Date(data.paymentDate),
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      notes: data.notes,
      receiptFolio: data.receiptFolio,
      receiptUrl,
      receiptFileName,
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
    @Body() data: UploadExtraordinaryFeeProofRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let proofUrl = data.proofUrl;
    let proofFileName = data.proofFileName;

    if (file) {
      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'extraordinary-fees-proofs',
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

    return await this.uploadExtraordinaryFeeProofUseCase.execute({
      chargeId,
      condominiumId,
      proofUrl: proofUrl || '',
      proofFileName,
      reference: data.reference,
      notes: data.notes,
    });
  }

  @Post('charges/:chargeId/review-proof')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('receiptFile'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.reviewResidentProof)
  async reviewResidentProof(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Param('chargeId') chargeId: string,
    @Body() data: ReviewExtraordinaryFeeProofRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let receiptUrl = data.receiptUrl;
    let receiptFileName = data.receiptFileName;

    if (file) {
      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'extraordinary-fees-receipts',
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

      receiptUrl = uploadResult.key;
      receiptFileName = file.originalname;
    }

    return await this.reviewExtraordinaryFeeProofUseCase.execute({
      chargeId,
      condominiumId,
      userId: user.id,
      action: data.action,
      reference: data.reference,
      rejectReason: data.rejectReason,
      receiptFolio: data.receiptFolio,
      receiptUrl,
      receiptFileName,
    });
  }
}
