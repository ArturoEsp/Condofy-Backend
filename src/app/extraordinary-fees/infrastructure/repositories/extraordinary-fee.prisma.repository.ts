import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { StorageService } from '@/core/domain/services/storage.service';
import ExtraordinaryFeeRepository, {
  CreateExtraordinaryFeeData,
  RegisterExtraordinaryFeePaymentData,
  ReviewExtraordinaryFeeProofData,
  UploadExtraordinaryFeeProofData,
} from '../../domain/repositories/extraordinary-fee.repository';
import {
  ExtraordinaryFeeEntity,
  ExtraordinaryFeeStatusType,
} from '../../domain/entities/extraordinary-fee.entity';
import { ExtraordinaryFeeChargeEntity } from '../../domain/entities/extraordinary-fee-charge.entity';
import { ExtraordinaryFeeMapper } from '../mappers/extraordinary-fee.mapper';
import {
  ExtraordinaryFeeStatus,
  MaintenanceChargeStatus,
  PaymentMethod,
} from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class ExtraordinaryFeePrismaRepository implements ExtraordinaryFeeRepository {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROVIDES_NAMES.StorageService)
    private readonly storageService: StorageService,
  ) {}

  async create(
    data: CreateExtraordinaryFeeData,
  ): Promise<ExtraordinaryFeeEntity> {
    // 1. Obtener todas las viviendas activas del condominio
    const activeHouses = await this.prisma.house.findMany({
      where: {
        condominiumId: data.condominiumId,
        isDisabled: false,
      },
      orderBy: [{ tower: 'asc' }, { houseNumber: 'asc' }],
    });

    const amountPerHouse = data.amountPerHouse;
    const totalTargetAmount =
      data.totalTargetAmount || amountPerHouse * activeHouses.length;

    // 2. Transacción de creación de la cuota, sus documentos y cargos para cada casa
    const created = await this.prisma.$transaction(async (tx) => {
      const fee = await tx.extraordinaryFee.create({
        data: {
          condominiumId: data.condominiumId,
          createdById: data.createdById,
          title: data.title.trim(),
          description: data.description.trim(),
          amountPerHouse,
          totalTargetAmount,
          dueDate: new Date(data.dueDate),
          status: ExtraordinaryFeeStatus.ACTIVE,
          useCustomBankAccount: Boolean(data.useCustomBankAccount),
          bankName: data.bankName?.trim() || null,
          accountHolder: data.accountHolder?.trim() || null,
          clabe: data.clabe?.trim() || null,
          accountNumber: data.accountNumber?.trim() || null,
          paymentReferenceRule: data.paymentReferenceRule?.trim() || null,
        },
      });

      // Guardar documentos / cotizaciones si existen
      if (data.documents && data.documents.length > 0) {
        await tx.extraordinaryFeeDocument.createMany({
          data: data.documents.map((doc) => ({
            extraordinaryFeeId: fee.id,
            title: doc.title.trim(),
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileType: doc.fileType || null,
            fileSize: doc.fileSize || null,
          })),
        });
      }

      // Crear cargos para cada vivienda activa
      if (activeHouses.length > 0) {
        await tx.extraordinaryFeeCharge.createMany({
          data: activeHouses.map((house) => ({
            extraordinaryFeeId: fee.id,
            houseId: house.id,
            amount: amountPerHouse,
            paidAmount: 0,
            status: MaintenanceChargeStatus.PENDING,
          })),
        });
      }

      return fee;
    });

    return (await this.findById(created.id, data.condominiumId))!;
  }

  async findAll(
    condominiumId: string,
    status?: string,
  ): Promise<ExtraordinaryFeeEntity[]> {
    const where: any = { condominiumId };
    if (status && status !== 'ALL') {
      where.status = status as ExtraordinaryFeeStatus;
    }

    const items = await this.prisma.extraordinaryFee.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        documents: true,
        charges: {
          include: {
            house: {
              include: {
                residents: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    return await Promise.all(
      items.map((i) =>
        ExtraordinaryFeeMapper.toFeeDomain(i, this.storageService),
      ),
    );
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<ExtraordinaryFeeEntity | null> {
    const item = await this.prisma.extraordinaryFee.findFirst({
      where: { id, condominiumId },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
        charges: {
          include: {
            house: {
              include: {
                residents: {
                  include: { user: true },
                },
              },
            },
          },
          orderBy: { house: { houseNumber: 'asc' } },
        },
      },
    });

    if (!item) return null;

    return await ExtraordinaryFeeMapper.toFeeDomain(item, this.storageService);
  }

  async updateStatus(
    id: string,
    condominiumId: string,
    status: ExtraordinaryFeeStatusType,
  ): Promise<ExtraordinaryFeeEntity> {
    const existing = await this.prisma.extraordinaryFee.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('Cuota extraordinaria no encontrada');
    }

    await this.prisma.extraordinaryFee.update({
      where: { id },
      data: { status: status as ExtraordinaryFeeStatus },
    });

    return (await this.findById(id, condominiumId))!;
  }

  async delete(
    id: string,
    condominiumId: string,
  ): Promise<ExtraordinaryFeeEntity> {
    const existing = await this.findById(id, condominiumId);
    if (!existing) {
      throw new NotFoundException('Cuota extraordinaria no encontrada');
    }

    // Limpiar archivos en S3
    for (const doc of existing.documents) {
      if (doc.fileUrl) {
        try {
          await this.storageService.deleteFile(doc.fileUrl);
        } catch (err) {}
      }
    }

    await this.prisma.extraordinaryFee.delete({
      where: { id },
    });

    return existing;
  }

  async registerPayment(
    data: RegisterExtraordinaryFeePaymentData,
  ): Promise<ExtraordinaryFeeChargeEntity> {
    const charge = await this.prisma.extraordinaryFeeCharge.findFirst({
      where: {
        id: data.chargeId,
        extraordinaryFee: { condominiumId: data.condominiumId },
      },
      include: { house: true },
    });

    if (!charge) {
      throw new NotFoundException(
        'Cargo de cuota extraordinaria no encontrado',
      );
    }

    let prismaMethod: PaymentMethod = PaymentMethod.TRANSFER;
    const upper = (data.paymentMethod || '').toUpperCase();
    if (upper === 'CASH') prismaMethod = PaymentMethod.CASH;
    else if (upper === 'CARD') prismaMethod = PaymentMethod.CARD;
    else if (upper === 'CHECK') prismaMethod = PaymentMethod.CHECK;
    else if (upper === 'SPEI') prismaMethod = PaymentMethod.SPEI;

    const folio =
      data.receiptFolio ||
      `REC-EXTRA-${charge.house?.houseNumber || 'H'}-${Date.now().toString().slice(-6)}`;

    const updated = await this.prisma.extraordinaryFeeCharge.update({
      where: { id: data.chargeId },
      data: {
        paidAmount: data.paidAmount,
        status: MaintenanceChargeStatus.PAID,
        paymentDate: new Date(data.paymentDate),
        paymentMethod: prismaMethod,
        reference: data.reference || null,
        notes: data.notes || null,
        receiptFolio: folio,
        receiptUrl: data.receiptUrl || null,
        receiptUploadedAt: new Date(),
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
          },
        },
      },
    });

    return await ExtraordinaryFeeMapper.toChargeDomain(
      updated,
      this.storageService,
    );
  }

  async uploadResidentProof(
    data: UploadExtraordinaryFeeProofData,
  ): Promise<ExtraordinaryFeeChargeEntity> {
    const charge = await this.prisma.extraordinaryFeeCharge.findFirst({
      where: {
        id: data.chargeId,
        extraordinaryFee: { condominiumId: data.condominiumId },
      },
    });

    if (!charge) {
      throw new NotFoundException(
        'Cargo de cuota extraordinaria no encontrado',
      );
    }

    const updated = await this.prisma.extraordinaryFeeCharge.update({
      where: { id: data.chargeId },
      data: {
        proofUrl: data.proofUrl,
        proofFileName: data.proofFileName || null,
        reference: data.reference || null,
        notes: data.notes || null,
        proofUploadedAt: new Date(),
        status: MaintenanceChargeStatus.IN_REVIEW,
      },
      include: {
        house: {
          include: {
            residents: {
              include: { user: true },
            },
          },
        },
      },
    });

    return await ExtraordinaryFeeMapper.toChargeDomain(
      updated,
      this.storageService,
    );
  }

  async reviewResidentProof(
    data: ReviewExtraordinaryFeeProofData,
  ): Promise<ExtraordinaryFeeChargeEntity> {
    const charge = await this.prisma.extraordinaryFeeCharge.findFirst({
      where: {
        id: data.chargeId,
        extraordinaryFee: { condominiumId: data.condominiumId },
      },
      include: { house: true },
    });

    if (!charge) {
      throw new NotFoundException(
        'Cargo de cuota extraordinaria no encontrado',
      );
    }

    if (data.action === 'APPROVE') {
      const folio =
        data.receiptFolio ||
        `REC-EXTRA-${charge.house?.houseNumber || 'H'}-${Date.now().toString().slice(-6)}`;

      const updated = await this.prisma.extraordinaryFeeCharge.update({
        where: { id: data.chargeId },
        data: {
          paidAmount: charge.amount,
          status: MaintenanceChargeStatus.PAID,
          paymentDate: charge.proofUploadedAt || new Date(),
          paymentMethod: PaymentMethod.TRANSFER,
          reference: data.reference || charge.reference,
          receiptFolio: folio,
          receiptUrl: data.receiptUrl || charge.proofUrl,
          receiptUploadedAt: new Date(),
        },
        include: {
          house: {
            include: {
              residents: {
                include: { user: true },
              },
            },
          },
        },
      });

      return await ExtraordinaryFeeMapper.toChargeDomain(
        updated,
        this.storageService,
      );
    } else {
      const updated = await this.prisma.extraordinaryFeeCharge.update({
        where: { id: data.chargeId },
        data: {
          status: MaintenanceChargeStatus.PENDING,
          notes: data.rejectReason
            ? `[Comprobante rechazado: ${data.rejectReason}]`
            : '[Comprobante rechazado]',
        },
        include: {
          house: {
            include: {
              residents: {
                include: { user: true },
              },
            },
          },
        },
      });

      return await ExtraordinaryFeeMapper.toChargeDomain(
        updated,
        this.storageService,
      );
    }
  }

  async getMyCharges(
    userId: string,
    condominiumId: string,
  ): Promise<ExtraordinaryFeeEntity[]> {
    const resident = await this.prisma.residentProfile.findFirst({
      where: { userId, condominiumId },
    });

    let houseId = resident?.houseId;
    if (!houseId) {
      const firstHouse = await this.prisma.house.findFirst({
        where: { condominiumId, isDisabled: false },
      });
      if (firstHouse) houseId = firstHouse.id;
    }

    if (!houseId) return [];

    const fees = await this.prisma.extraordinaryFee.findMany({
      where: {
        condominiumId,
        status: {
          in: [ExtraordinaryFeeStatus.ACTIVE, ExtraordinaryFeeStatus.COMPLETED],
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true },
        },
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
        charges: {
          where: { houseId },
          include: {
            house: {
              include: {
                residents: {
                  include: { user: true },
                },
              },
            },
          },
        },
      },
    });

    return await Promise.all(
      fees.map((f) =>
        ExtraordinaryFeeMapper.toFeeDomain(f, this.storageService),
      ),
    );
  }
}
