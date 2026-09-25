import 'multer';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
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

import * as docs from '../docs/expenses.docs';
import { CreateExpenseUseCase } from '../../application/use-cases/create-expense.usecase';
import { GetExpensesUseCase } from '../../application/use-cases/get-expenses.usecase';
import { GetExpenseByIdUseCase } from '../../application/use-cases/get-expense-by-id.usecase';
import { UpdateExpenseUseCase } from '../../application/use-cases/update-expense.usecase';
import { DeleteExpenseUseCase } from '../../application/use-cases/delete-expense.usecase';
import { GetExpensesSummaryUseCase } from '../../application/use-cases/get-expenses-summary.usecase';
import { GetTransparencySettingsUseCase } from '../../application/use-cases/get-transparency-settings.usecase';
import { UpdateTransparencySettingsUseCase } from '../../application/use-cases/update-transparency-settings.usecase';
import { GetTransparencyReportUseCase } from '../../application/use-cases/get-transparency-report.usecase';

import { CreateExpenseRequest } from '../dtos/requests/create-expense.request';
import { UpdateExpenseRequest } from '../dtos/requests/update-expense.request';
import { ParamsListExpensesRequest } from '../dtos/requests/params-list-expenses.request';
import { UpdateTransparencySettingsRequest } from '../dtos/requests/update-transparency-settings.request';
import { ExpenseResponse } from '../dtos/responses/expense.response';
import { ExpensesListResponse } from '../dtos/responses/expenses-list.response';
import { ExpensesSummaryResponse } from '../dtos/responses/expenses-summary.response';
import {
  TransparencyConfigResponse,
  TransparencyReportResponse,
} from '../dtos/responses/transparency.response';

const UTF8_BOM = '\uFEFF';

const escapeCsv = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

@ApiTags('Expenses')
@Controller(':condominiumKey/expenses')
export class ExpensesController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly getExpensesUseCase: GetExpensesUseCase,
    private readonly getExpenseByIdUseCase: GetExpenseByIdUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase,
    private readonly getExpensesSummaryUseCase: GetExpensesSummaryUseCase,
    private readonly getTransparencySettingsUseCase: GetTransparencySettingsUseCase,
    private readonly updateTransparencySettingsUseCase: UpdateTransparencySettingsUseCase,
    private readonly getTransparencyReportUseCase: GetTransparencyReportUseCase,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('invoiceFile'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.createExpense)
  async create(
    @CondominiumId() condominiumId: string,
    @CurrentUser() user: AuthUserEntity,
    @Body() data: CreateExpenseRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ExpenseResponse> {
    let invoiceUrl = data.invoiceUrl;
    let invoiceFileName = data.invoiceFileName;
    let invoiceFileType: string | undefined = undefined;

    if (file) {
      const isPdf =
        file.mimetype === 'application/pdf' ||
        file.originalname.toLowerCase().endsWith('.pdf');
      invoiceFileType = isPdf ? 'pdf' : 'image';

      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'expenses',
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

      invoiceUrl = uploadResult.key;
      invoiceFileName = file.originalname;
    }

    const created = await this.createExpenseUseCase.execute({
      condominiumId,
      concept: data.concept,
      description: data.description,
      amount: Number(data.amount),
      expenseDate: new Date(data.expenseDate),
      period: data.period,
      category: data.category,
      paymentMethod: data.paymentMethod,
      status: data.status,
      supplier: data.supplier,
      reference: data.reference,
      invoiceUrl,
      invoiceFileName,
      invoiceFileType,
      createdById: user.id,
    });

    return ExpenseResponse.fromDomain(created);
  }

  @Get()
  @Roles('ADMIN')
  @ApiEndpoint(docs.getExpenses)
  async findByPeriod(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListExpensesRequest,
  ): Promise<ExpensesListResponse> {
    const result = await this.getExpensesUseCase.execute(condominiumId, params);
    return {
      period: result.period,
      count: result.count,
      totalAmount: result.totalAmount,
      records: result.records.map(ExpenseResponse.fromDomain),
    };
  }

  @Get('summary')
  @Roles('ADMIN')
  @ApiEndpoint(docs.getExpenseSummary)
  async getSummary(
    @CondominiumId() condominiumId: string,
    @Query('period') period?: string,
  ): Promise<ExpensesSummaryResponse> {
    const now = new Date();
    const activePeriod =
      period ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return await this.getExpensesSummaryUseCase.execute(
      condominiumId,
      activePeriod,
    );
  }

  @Get('export')
  @Roles('ADMIN')
  @ApiEndpoint(docs.exportExpenses)
  async export(
    @CondominiumId() condominiumId: string,
    @Query() params: ParamsListExpensesRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.getExpensesUseCase.execute(condominiumId, params);
    const fileName = `Reporte_Egresos_${result.period}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    const lines: string[] = [];
    lines.push(
      `${escapeCsv('CONDOFY - REPORTE DE EGRESOS Y GASTOS OPERATIVOS')},,,,,,,`,
    );
    lines.push(
      `${escapeCsv('Periodo:')},${escapeCsv(result.period)},${escapeCsv('Total Egresos:')},${escapeCsv('$' + result.totalAmount.toFixed(2))},,,,`,
    );
    lines.push(',,,,,,,');

    const headers = [
      'Fecha',
      'Concepto',
      'Categoría',
      'Proveedor / Beneficiario',
      'Forma de Pago',
      'Folio / Referencia',
      'Estatus',
      'Monto ($ MXN)',
      'Registrado Por',
    ];
    lines.push(headers.map(escapeCsv).join(','));

    for (const exp of result.records) {
      lines.push(
        [
          exp.expenseDate instanceof Date
            ? exp.expenseDate.toISOString().split('T')[0]
            : String(exp.expenseDate).split('T')[0],
          exp.concept,
          exp.category,
          exp.supplier || 'N/A',
          exp.paymentMethod,
          exp.reference || 'N/A',
          exp.status,
          exp.amount.toFixed(2),
          exp.createdByName || 'Administración',
        ]
          .map(escapeCsv)
          .join(','),
      );
    }

    return UTF8_BOM + lines.join('\r\n');
  }

  @Get('transparency/settings')
  @Roles('ADMIN')
  @ApiEndpoint(docs.getTransparencySettings)
  async getTransparencySettings(@CondominiumId() condominiumId: string) {
    return await this.getTransparencySettingsUseCase.execute(condominiumId);
  }

  @Put('transparency/settings')
  @Roles('ADMIN')
  @ApiEndpoint(docs.updateTransparencySettings)
  async updateTransparencySettings(
    @CondominiumId() condominiumId: string,
    @Body() data: UpdateTransparencySettingsRequest,
  ) {
    return await this.updateTransparencySettingsUseCase.execute(
      condominiumId,
      data,
    );
  }

  @Get('transparency')
  @Roles('ADMIN', 'RESIDENT')
  @ApiEndpoint(docs.getTransparencyReport)
  async getTransparencyReport(
    @CondominiumId() condominiumId: string,
    @Query('period') period?: string,
  ) {
    return await this.getTransparencyReportUseCase.execute(
      condominiumId,
      period,
    );
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiEndpoint(docs.getExpenseById)
  async findById(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<ExpenseResponse> {
    const record = await this.getExpenseByIdUseCase.execute(id, condominiumId);
    return ExpenseResponse.fromDomain(record);
  }

  @Put(':id')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('invoiceFile'))
  @ApiConsumes('application/json', 'multipart/form-data')
  @ApiEndpoint(docs.updateExpense)
  async update(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
    @Body() data: UpdateExpenseRequest,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<ExpenseResponse> {
    let invoiceUrl = data.invoiceUrl;
    let invoiceFileName = data.invoiceFileName;
    let invoiceFileType: string | undefined = undefined;

    if (file) {
      const isPdf =
        file.mimetype === 'application/pdf' ||
        file.originalname.toLowerCase().endsWith('.pdf');
      invoiceFileType = isPdf ? 'pdf' : 'image';

      const path = this.storageService.buildStoragePath({
        condominiumId,
        module: 'expenses',
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

      invoiceUrl = uploadResult.key;
      invoiceFileName = file.originalname;
    }

    const updated = await this.updateExpenseUseCase.execute({
      id,
      condominiumId,
      concept: data.concept,
      description: data.description,
      amount: data.amount !== undefined ? Number(data.amount) : undefined,
      expenseDate: data.expenseDate ? new Date(data.expenseDate) : undefined,
      period: data.period,
      category: data.category,
      paymentMethod: data.paymentMethod,
      status: data.status,
      supplier: data.supplier,
      reference: data.reference,
      invoiceUrl,
      invoiceFileName,
      invoiceFileType,
    });

    return ExpenseResponse.fromDomain(updated);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiEndpoint(docs.deleteExpense)
  async delete(
    @CondominiumId() condominiumId: string,
    @Param('id') id: string,
  ): Promise<ExpenseResponse> {
    const deleted = await this.deleteExpenseUseCase.execute(id, condominiumId);
    return ExpenseResponse.fromDomain(deleted);
  }
}
