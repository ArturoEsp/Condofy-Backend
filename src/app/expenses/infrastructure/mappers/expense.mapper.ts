import {
  Expense as PrismaExpense,
  User as PrismaUser,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import {
  ExpenseCategoryDomain,
  ExpenseEntity,
  ExpenseStatusDomain,
} from '../../domain/entities/expense.entity';
import { StorageService } from '@/core/domain/services/storage.service';

export type PrismaExpenseWithRelations = PrismaExpense & {
  createdBy?: Pick<PrismaUser, 'firstName' | 'lastName'> | null;
};

export class ExpenseMapper {
  static toDomain(raw: PrismaExpenseWithRelations): ExpenseEntity {
    const entity = new ExpenseEntity();
    entity.id = raw.id;
    entity.condominiumId = raw.condominiumId;
    entity.concept = raw.concept;
    entity.description = raw.description;
    entity.amount = Number(raw.amount);
    entity.expenseDate = raw.expenseDate;
    entity.period = raw.period;
    entity.category = raw.category as ExpenseCategoryDomain;
    entity.paymentMethod = raw.paymentMethod;
    entity.status = raw.status as ExpenseStatusDomain;
    entity.supplier = raw.supplier;
    entity.reference = raw.reference;
    entity.invoiceUrl = raw.invoiceUrl;
    entity.invoiceFileName = raw.invoiceFileName;
    entity.invoiceFileType = raw.invoiceFileType;
    entity.createdById = raw.createdById;
    entity.createdByName = raw.createdBy
      ? `${raw.createdBy.firstName || ''} ${raw.createdBy.lastName || ''}`.trim() ||
        'Administración'
      : 'Administración';
    entity.createdAt = raw.createdAt;
    entity.updatedAt = raw.updatedAt;
    return entity;
  }

  static async toDomainWithSignedUrl(
    raw: PrismaExpenseWithRelations,
    storageService?: StorageService,
  ): Promise<ExpenseEntity> {
    const entity = this.toDomain(raw);
    if (entity.invoiceUrl && storageService) {
      try {
        entity.invoiceUrl = await storageService.getPresignedUrl(
          entity.invoiceUrl,
        );
      } catch (err) {
        // En caso de error conservamos el path original
      }
    }
    return entity;
  }
}
