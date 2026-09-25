import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import ExpensesRepository, {
  CreateExpenseData,
  ExpensesSummary,
  FindExpensesParams,
  TransparencyReport,
  UpdateExpenseData,
  UpdateTransparencyConfigData,
} from '../../domain/repositories/expenses.repository';
import { ExpenseEntity } from '../../domain/entities/expense.entity';
import { ExpenseMapper } from '../mappers/expense.mapper';
import {
  ExpenseCategory,
  ExpenseStatus,
  PaymentMethod,
} from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class ExpensesPrismaRepository implements ExpensesRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  async create(data: CreateExpenseData): Promise<ExpenseEntity> {
    const period =
      data.period || new Date(data.expenseDate).toISOString().substring(0, 7);

    const created = await this.prisma.expense.create({
      data: {
        condominiumId: data.condominiumId,
        concept: data.concept.trim(),
        description: data.description?.trim() || null,
        amount: data.amount,
        expenseDate: new Date(data.expenseDate),
        period,
        category: data.category as ExpenseCategory,
        paymentMethod:
          (data.paymentMethod as PaymentMethod) || PaymentMethod.TRANSFER,
        status: (data.status as ExpenseStatus) || ExpenseStatus.PAID,
        supplier: data.supplier?.trim() || null,
        reference: data.reference?.trim() || null,
        invoiceUrl: data.invoiceUrl || null,
        invoiceFileName: data.invoiceFileName || null,
        invoiceFileType: data.invoiceFileType || null,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return await ExpenseMapper.toDomainWithSignedUrl(
      created,
      this.storageService,
    );
  }

  async update(
    id: string,
    condominiumId: string,
    data: UpdateExpenseData,
  ): Promise<ExpenseEntity> {
    const existing = await this.prisma.expense.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('Gasto operativo no encontrado');
    }

    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(data.concept !== undefined && { concept: data.concept.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim() || null,
        }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.expenseDate !== undefined && {
          expenseDate: new Date(data.expenseDate),
          period:
            data.period ||
            new Date(data.expenseDate).toISOString().substring(0, 7),
        }),
        ...(data.category !== undefined && {
          category: data.category as ExpenseCategory,
        }),
        ...(data.paymentMethod !== undefined && {
          paymentMethod: data.paymentMethod as PaymentMethod,
        }),
        ...(data.status !== undefined && {
          status: data.status as ExpenseStatus,
        }),
        ...(data.supplier !== undefined && {
          supplier: data.supplier?.trim() || null,
        }),
        ...(data.reference !== undefined && {
          reference: data.reference?.trim() || null,
        }),
        ...(data.invoiceUrl !== undefined && { invoiceUrl: data.invoiceUrl }),
        ...(data.invoiceFileName !== undefined && {
          invoiceFileName: data.invoiceFileName,
        }),
        ...(data.invoiceFileType !== undefined && {
          invoiceFileType: data.invoiceFileType,
        }),
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return await ExpenseMapper.toDomainWithSignedUrl(
      updated,
      this.storageService,
    );
  }

  async delete(id: string, condominiumId: string): Promise<ExpenseEntity> {
    const existing = await this.prisma.expense.findFirst({
      where: { id, condominiumId },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Gasto operativo no encontrado');
    }

    await this.prisma.expense.delete({
      where: { id },
    });

    return ExpenseMapper.toDomain(existing);
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<ExpenseEntity | null> {
    const record = await this.prisma.expense.findFirst({
      where: { id, condominiumId },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!record) return null;

    return await ExpenseMapper.toDomainWithSignedUrl(
      record,
      this.storageService,
    );
  }

  async findByPeriod(
    condominiumId: string,
    params: FindExpensesParams,
  ): Promise<{
    period: string;
    count: number;
    totalAmount: number;
    records: ExpenseEntity[];
  }> {
    const now = new Date();
    const period =
      params.period ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const where: any = {
      condominiumId,
      period,
    };

    if (params.category && params.category !== 'ALL') {
      where.category = params.category as ExpenseCategory;
    }

    if (params.status && params.status !== 'ALL') {
      where.status = params.status as ExpenseStatus;
    }

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { concept: { contains: q, mode: 'insensitive' } },
        { supplier: { contains: q, mode: 'insensitive' } },
        { reference: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const records = await Promise.all(
      expenses.map((e) =>
        ExpenseMapper.toDomainWithSignedUrl(e, this.storageService),
      ),
    );

    const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

    return {
      period,
      count: records.length,
      totalAmount,
      records,
    };
  }

  async getSummary(
    condominiumId: string,
    period: string,
  ): Promise<ExpensesSummary> {
    const expenses = await this.prisma.expense.findMany({
      where: {
        condominiumId,
        period,
      },
    });

    const totalExpenses = expenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const paidList = expenses.filter((e) => e.status === ExpenseStatus.PAID);
    const pendingList = expenses.filter(
      (e) => e.status === ExpenseStatus.PENDING,
    );

    const paidAmount = paidList.reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingAmount = pendingList.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const categoryMap: Record<string, { amount: number; count: number }> = {};
    for (const exp of paidList) {
      if (!categoryMap[exp.category]) {
        categoryMap[exp.category] = { amount: 0, count: 0 };
      }
      categoryMap[exp.category].amount += Number(exp.amount);
      categoryMap[exp.category].count += 1;
    }

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([cat, val]) => ({
        category: cat,
        amount: val.amount,
        count: val.count,
        percentage:
          paidAmount > 0 ? Math.round((val.amount / paidAmount) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      period,
      totalExpenses,
      paidAmount,
      pendingAmount,
      paidCount: paidList.length,
      pendingCount: pendingList.length,
      categoryBreakdown,
    };
  }

  async getTransparencyConfig(condominiumId: string): Promise<any> {
    const found = await this.prisma.condominiumTransparencyConfig.findUnique({
      where: { condominiumId },
    });

    if (found) {
      return found;
    }

    return await this.prisma.condominiumTransparencyConfig.create({
      data: {
        condominiumId,
        isEnabled: true,
        showExpenses: true,
        showIncomes: true,
        showBalance: true,
        showSuppliers: false,
        allowInvoiceViewing: true,
        allowInvoiceDownload: false,
      },
    });
  }

  async updateTransparencyConfig(
    condominiumId: string,
    data: UpdateTransparencyConfigData,
  ): Promise<any> {
    return await this.prisma.condominiumTransparencyConfig.upsert({
      where: { condominiumId },
      update: {
        ...(data.isEnabled !== undefined ? { isEnabled: data.isEnabled } : {}),
        ...(data.showExpenses !== undefined
          ? { showExpenses: data.showExpenses }
          : {}),
        ...(data.showIncomes !== undefined
          ? { showIncomes: data.showIncomes }
          : {}),
        ...(data.showBalance !== undefined
          ? { showBalance: data.showBalance }
          : {}),
        ...(data.showSuppliers !== undefined
          ? { showSuppliers: data.showSuppliers }
          : {}),
        ...(data.showInvoices !== undefined
          ? { allowInvoiceViewing: data.showInvoices }
          : {}),
        ...(data.showDetailedReceipts !== undefined
          ? { allowInvoiceDownload: data.showDetailedReceipts }
          : {}),
      },
      create: {
        condominiumId,
        isEnabled: data.isEnabled ?? true,
        showExpenses: data.showExpenses ?? true,
        showIncomes: data.showIncomes ?? true,
        showBalance: data.showBalance ?? true,
        showSuppliers: data.showSuppliers ?? false,
        allowInvoiceViewing: data.showInvoices ?? true,
        allowInvoiceDownload: data.showDetailedReceipts ?? false,
      },
    });
  }

  async getTransparencyReport(
    condominiumId: string,
    period?: string,
  ): Promise<TransparencyReport> {
    const targetPeriod = period || new Date().toISOString().substring(0, 7);

    const rawConfig = await this.getTransparencyConfig(condominiumId);
    const config = {
      isEnabled: rawConfig.isEnabled,
      showExpenses: rawConfig.showExpenses,
      showIncomes: rawConfig.showIncomes,
      showBalance: rawConfig.showBalance,
      showSuppliers: rawConfig.showSuppliers,
      showInvoices: rawConfig.allowInvoiceViewing,
      showDetailedReceipts: rawConfig.allowInvoiceDownload,
    };

    if (!config.isEnabled) {
      return {
        config,
        period: targetPeriod,
        summary: {
          initialBalance: 0,
          initialReserveFund: 0,
          periodMaintenanceIncome: 0,
          periodExtraIncome: 0,
          totalPeriodIncome: 0,
          totalPeriodExpenses: 0,
          periodNetCashFlow: 0,
          currentAvailableBalance: 0,
        },
        expensesBreakdown: [],
        expenses: [],
        incomesBreakdown: [],
        extraIncomes: [],
      };
    }

    const billingConfig = await this.prisma.condominiumBillingConfig.findUnique(
      {
        where: { condominiumId },
      },
    );
    const initialBalance = Number(billingConfig?.initialBalance || 0);
    const initialReserveFund = Number(billingConfig?.initialReserveFund || 0);

    const [yearStr, monthStr] = targetPeriod.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const periodCharges = await this.prisma.maintenanceCharge.findMany({
      where: {
        condominiumId,
        status: 'PAID',
        OR: [
          { maintenancePeriod: { year, month } },
          { dueDate: { gte: startDate, lte: endDate } },
        ],
      },
      select: {
        paidAmount: true,
      },
    });
    const periodMaintenanceIncome = periodCharges.reduce(
      (sum, c) => sum + Number(c.paidAmount),
      0,
    );

    const rawExtraIncomes = await this.prisma.extraIncome.findMany({
      where: {
        condominiumId,
        incomeDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { incomeDate: 'desc' },
    });
    const periodExtraIncome = rawExtraIncomes.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const totalPeriodIncome = periodMaintenanceIncome + periodExtraIncome;

    const rawExpenses = await this.prisma.expense.findMany({
      where: {
        condominiumId,
        period: targetPeriod,
        status: ExpenseStatus.PAID,
      },
      orderBy: { expenseDate: 'desc' },
    });
    const totalPeriodExpenses = rawExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );
    const periodNetCashFlow = totalPeriodIncome - totalPeriodExpenses;

    const allChargesAgg = await this.prisma.maintenanceCharge.aggregate({
      where: { condominiumId, status: 'PAID' },
      _sum: { paidAmount: true },
    });
    const allExtraIncomesAgg = await this.prisma.extraIncome.aggregate({
      where: { condominiumId },
      _sum: { amount: true },
    });
    const allExpensesAgg = await this.prisma.expense.aggregate({
      where: { condominiumId, status: ExpenseStatus.PAID },
      _sum: { amount: true },
    });

    const allTimeIncome =
      Number(allChargesAgg._sum.paidAmount || 0) +
      Number(allExtraIncomesAgg._sum.amount || 0);
    const allTimeExpenses = Number(allExpensesAgg._sum.amount || 0);
    const currentAvailableBalance =
      initialBalance + allTimeIncome - allTimeExpenses;

    const catMap: Record<string, number> = {};
    for (const exp of rawExpenses) {
      catMap[exp.category] = (catMap[exp.category] || 0) + Number(exp.amount);
    }
    const expensesBreakdown = Object.entries(catMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalPeriodExpenses > 0
            ? Math.round((amount / totalPeriodExpenses) * 100)
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const expenses = await Promise.all(
      rawExpenses.map(async (exp) => {
        let invoiceUrl = exp.invoiceUrl;
        if (
          config.showInvoices &&
          invoiceUrl &&
          invoiceUrl.startsWith('condominiums/')
        ) {
          try {
            invoiceUrl = await this.storageService.getPresignedUrl(
              invoiceUrl,
              7200,
            );
          } catch (err) {}
        }
        return {
          id: exp.id,
          concept: exp.concept,
          amount: Number(exp.amount),
          category: exp.category,
          expenseDate: exp.expenseDate.toISOString().split('T')[0],
          paymentMethod: exp.paymentMethod,
          supplier: config.showSuppliers ? exp.supplier : null,
          invoiceUrl: config.showInvoices ? invoiceUrl : null,
          invoiceFileName: config.showInvoices ? exp.invoiceFileName : null,
        };
      }),
    );

    const incomesBreakdown: {
      category: string;
      amount: number;
      percentage: number;
    }[] = [];
    if (periodMaintenanceIncome > 0) {
      incomesBreakdown.push({
        category: 'MAINTENANCE_FEES',
        amount: periodMaintenanceIncome,
        percentage:
          totalPeriodIncome > 0
            ? Math.round((periodMaintenanceIncome / totalPeriodIncome) * 100)
            : 0,
      });
    }

    const extraCatMap: Record<string, number> = {};
    for (const inc of rawExtraIncomes) {
      extraCatMap[inc.category] =
        (extraCatMap[inc.category] || 0) + Number(inc.amount);
    }
    for (const [cat, amt] of Object.entries(extraCatMap)) {
      incomesBreakdown.push({
        category: cat,
        amount: amt,
        percentage:
          totalPeriodIncome > 0
            ? Math.round((amt / totalPeriodIncome) * 100)
            : 0,
      });
    }

    const extraIncomes = rawExtraIncomes.map((inc) => ({
      id: inc.id,
      concept: inc.concept,
      amount: Number(inc.amount),
      category: inc.category,
      incomeDate: inc.incomeDate.toISOString().split('T')[0],
      paymentMethod: inc.paymentMethod,
    }));

    return {
      config,
      period: targetPeriod,
      summary: {
        initialBalance: config.showBalance ? initialBalance : 0,
        initialReserveFund: config.showBalance ? initialReserveFund : 0,
        periodMaintenanceIncome: config.showIncomes
          ? periodMaintenanceIncome
          : 0,
        periodExtraIncome: config.showIncomes ? periodExtraIncome : 0,
        totalPeriodIncome: config.showIncomes ? totalPeriodIncome : 0,
        totalPeriodExpenses: config.showExpenses ? totalPeriodExpenses : 0,
        periodNetCashFlow:
          config.showIncomes && config.showExpenses ? periodNetCashFlow : 0,
        currentAvailableBalance: config.showBalance
          ? currentAvailableBalance
          : 0,
      },
      expensesBreakdown: config.showExpenses ? expensesBreakdown : [],
      expenses: config.showExpenses ? expenses : [],
      incomesBreakdown: config.showIncomes ? incomesBreakdown : [],
      extraIncomes: config.showIncomes ? extraIncomes : [],
    };
  }
}
