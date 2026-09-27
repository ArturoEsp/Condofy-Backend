import { StorageService } from '@/core/domain/services/storage.service';
import {
  ExtraordinaryFeeEntity,
  ExtraordinaryFeeKpis,
  ExtraordinaryFeeStatusType,
} from '../../domain/entities/extraordinary-fee.entity';
import { ExtraordinaryFeeDocumentEntity } from '../../domain/entities/extraordinary-fee-document.entity';
import {
  ExtraordinaryFeeChargeEntity,
  ExtraordinaryFeeChargeStatus,
} from '../../domain/entities/extraordinary-fee-charge.entity';

export class ExtraordinaryFeeMapper {
  static async toDocumentDomain(
    raw: any,
    storageService?: StorageService,
  ): Promise<ExtraordinaryFeeDocumentEntity> {
    let fileUrl = raw.fileUrl;
    if (fileUrl && storageService) {
      try {
        fileUrl = await storageService.getPresignedUrl(fileUrl);
      } catch (err) {
        // En caso de error conservamos el path original
      }
    }

    return {
      id: raw.id,
      extraordinaryFeeId: raw.extraordinaryFeeId,
      title: raw.title,
      fileName: raw.fileName,
      fileUrl,
      fileType: raw.fileType || null,
      fileSize: raw.fileSize || null,
      uploadedAt: raw.uploadedAt,
    };
  }

  static async toChargeDomain(
    raw: any,
    storageService?: StorageService,
  ): Promise<ExtraordinaryFeeChargeEntity> {
    let proofUrl = raw.proofUrl;
    if (proofUrl && storageService) {
      try {
        proofUrl = await storageService.getPresignedUrl(proofUrl);
      } catch (err) {}
    }

    let receiptUrl = raw.receiptUrl;
    if (receiptUrl && storageService) {
      try {
        receiptUrl = await storageService.getPresignedUrl(receiptUrl);
      } catch (err) {}
    }

    const resident = raw.house?.residents?.[0];

    return {
      id: raw.id,
      extraordinaryFeeId: raw.extraordinaryFeeId,
      houseId: raw.houseId,
      houseNumber: raw.house?.houseNumber || '',
      tower: raw.house?.tower || null,
      residentName: resident
        ? `${resident.firstName || ''} ${resident.lastName || ''}`.trim()
        : null,
      residentEmail: resident?.user?.email || null,
      residentPhone: resident?.phone || null,
      amount: Number(raw.amount || 0),
      paidAmount: Number(raw.paidAmount || 0),
      status: raw.status as ExtraordinaryFeeChargeStatus,
      paymentDate: raw.paymentDate || null,
      paymentMethod: raw.paymentMethod || null,
      reference: raw.reference || null,
      notes: raw.notes || null,
      proofUrl,
      proofFileName: raw.proofFileName || null,
      proofUploadedAt: raw.proofUploadedAt || null,
      receiptFolio: raw.receiptFolio || null,
      receiptUrl,
      receiptUploadedAt: raw.receiptUploadedAt || null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static async toFeeDomain(
    raw: any,
    storageService?: StorageService,
  ): Promise<ExtraordinaryFeeEntity> {
    const documents = raw.documents
      ? await Promise.all(
          raw.documents.map((d: any) =>
            this.toDocumentDomain(d, storageService),
          ),
        )
      : [];

    const charges = raw.charges
      ? await Promise.all(
          raw.charges.map((c: any) => this.toChargeDomain(c, storageService)),
        )
      : [];

    // Calcular KPIs
    let totalCollected = 0;
    let paidHousesCount = 0;
    let pendingHousesCount = 0;
    let inReviewHousesCount = 0;

    for (const c of charges) {
      totalCollected += c.paidAmount;
      if (c.status === 'PAID') paidHousesCount++;
      else if (c.status === 'IN_REVIEW') inReviewHousesCount++;
      else pendingHousesCount++;
    }

    const totalHouses = charges.length;
    const amountPerHouse = Number(raw.amountPerHouse || 0);
    const totalTarget =
      Number(raw.totalTargetAmount) || amountPerHouse * totalHouses;
    const progressPercentage =
      totalTarget > 0
        ? Math.min(100, Math.round((totalCollected / totalTarget) * 100))
        : 0;

    const kpis: ExtraordinaryFeeKpis = {
      totalTarget,
      totalCollected,
      progressPercentage,
      totalHouses,
      paidHousesCount,
      pendingHousesCount,
      inReviewHousesCount,
    };

    return {
      id: raw.id,
      condominiumId: raw.condominiumId,
      title: raw.title,
      description: raw.description,
      amountPerHouse,
      totalTargetAmount: raw.totalTargetAmount
        ? Number(raw.totalTargetAmount)
        : null,
      dueDate: raw.dueDate,
      status: raw.status as ExtraordinaryFeeStatusType,
      useCustomBankAccount: Boolean(raw.useCustomBankAccount),
      bankName: raw.bankName || null,
      accountHolder: raw.accountHolder || null,
      clabe: raw.clabe || null,
      accountNumber: raw.accountNumber || null,
      paymentReferenceRule: raw.paymentReferenceRule || null,
      createdById: raw.createdById,
      createdByName: raw.createdBy
        ? `${raw.createdBy.firstName || ''} ${raw.createdBy.lastName || ''}`.trim() ||
          'Administración'
        : 'Administración',
      documents,
      charges,
      kpis,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
