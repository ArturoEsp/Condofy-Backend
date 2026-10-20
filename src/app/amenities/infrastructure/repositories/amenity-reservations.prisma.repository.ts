import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  AmenityReservationStatus,
  AmenityPaymentStatus,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import {
  AmenityReservationsRepository,
  FindReservationsFilter,
} from '../../domain/repositories/amenity-reservations.repository';
import {
  AmenityReservationEntity,
  AmenityReservationProps,
} from '../../domain/entities/amenity-reservation.entity';
import { AmenityReservationMapper } from '../mappers/amenity-reservation.mapper';

@Injectable()
export class AmenityReservationsPrismaRepository implements AmenityReservationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  private get standardIncludes() {
    return {
      resident: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      },
      house: {
        select: {
          id: true,
          houseNumber: true,
          tower: true,
        },
      },
      amenity: {
        select: {
          id: true,
          name: true,
          cost: true,
          requiresDeposit: true,
          depositAmount: true,
          photos: true,
        },
      },
    };
  }

  async create(
    data: Omit<
      AmenityReservationProps,
      'id' | 'createdAt' | 'updatedAt' | 'resident' | 'house' | 'amenity'
    >,
  ): Promise<AmenityReservationEntity> {
    const created = await this.prisma.amenityReservation.create({
      data: {
        amenityId: data.amenityId,
        condominiumId: data.condominiumId,
        residentId: data.residentId,
        houseId: data.houseId,
        reservationDate: data.reservationDate,
        startTime: data.startTime,
        endTime: data.endTime,
        status: data.status,
        totalCost: new Prisma.Decimal(data.totalCost),
        depositAmount: new Prisma.Decimal(data.depositAmount),
        paymentStatus: data.paymentStatus,
        notes: data.notes,
        adminNotes: data.adminNotes,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
        cancelledAt: data.cancelledAt,
        cancelledBy: data.cancelledBy,
        cancellationReason: data.cancellationReason,
      },
      include: this.standardIncludes,
    });

    return AmenityReservationMapper.toDomain(created);
  }

  async findById(
    id: string,
    condominiumId: string,
  ): Promise<AmenityReservationEntity | null> {
    const found = await this.prisma.amenityReservation.findFirst({
      where: { id, condominiumId },
      include: this.standardIncludes,
    });

    if (!found) return null;
    return AmenityReservationMapper.toDomain(found);
  }

  async findOverlappingReservations(
    amenityId: string,
    date: Date,
    startTime?: string | null,
    endTime?: string | null,
    excludeReservationId?: string,
  ): Promise<AmenityReservationEntity[]> {
    // Normalizar la fecha a inicio y fin de día para comparar el mismo día calendario
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Prisma.AmenityReservationWhereInput = {
      amenityId,
      reservationDate: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        in: [
          AmenityReservationStatus.APPROVED,
          AmenityReservationStatus.PENDING_APPROVAL,
        ],
      },
    };

    if (excludeReservationId) {
      where.id = { not: excludeReservationId };
    }

    const reservations = await this.prisma.amenityReservation.findMany({
      where,
      include: this.standardIncludes,
    });

    // Si no se especifica startTime o endTime (es reserva por día completo), cualquier reserva en el día colisiona
    if (!startTime || !endTime) {
      return reservations.map((r) => AmenityReservationMapper.toDomain(r));
    }

    // Si ambas tienen horarios (HH:mm), comprobar solapamiento de rangos de horas
    const overlapping = reservations.filter((r) => {
      // Si la reserva existente fue de todo el día (sin horario específico)
      if (!r.startTime || !r.endTime) {
        return true;
      }

      // Dos rangos [A, B] y [C, D] se solapan si A < D y B > C
      return startTime < r.endTime && endTime > r.startTime;
    });

    return overlapping.map((r) => AmenityReservationMapper.toDomain(r));
  }

  async findAll(
    filter: FindReservationsFilter,
  ): Promise<AmenityReservationEntity[]> {
    const where: Prisma.AmenityReservationWhereInput = {
      condominiumId: filter.condominiumId,
    };

    if (filter.amenityId) where.amenityId = filter.amenityId;
    if (filter.residentId) where.residentId = filter.residentId;
    if (filter.houseId) where.houseId = filter.houseId;
    if (filter.status) where.status = filter.status;

    if (filter.startDate || filter.endDate) {
      where.reservationDate = {};
      if (filter.startDate) where.reservationDate.gte = filter.startDate;
      if (filter.endDate) where.reservationDate.lte = filter.endDate;
    }

    const reservations = await this.prisma.amenityReservation.findMany({
      where,
      orderBy: { reservationDate: 'desc' },
      include: this.standardIncludes,
    });

    return reservations.map((r) => AmenityReservationMapper.toDomain(r));
  }

  async updateStatus(
    id: string,
    condominiumId: string,
    data: {
      status: AmenityReservationStatus;
      adminNotes?: string | null;
      approvedAt?: Date | null;
      approvedBy?: string | null;
      cancelledAt?: Date | null;
      cancelledBy?: string | null;
      cancellationReason?: string | null;
      paymentStatus?: AmenityPaymentStatus;
    },
  ): Promise<AmenityReservationEntity> {
    const existing = await this.prisma.amenityReservation.findFirst({
      where: { id, condominiumId },
    });

    if (!existing) {
      throw new NotFoundException('La reservación solicitada no existe');
    }

    const updateData: Prisma.AmenityReservationUpdateInput = {
      status: data.status,
    };

    if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
    if (data.approvedAt !== undefined) updateData.approvedAt = data.approvedAt;
    if (data.approvedBy !== undefined) updateData.approvedBy = data.approvedBy;
    if (data.cancelledAt !== undefined)
      updateData.cancelledAt = data.cancelledAt;
    if (data.cancelledBy !== undefined)
      updateData.cancelledBy = data.cancelledBy;
    if (data.cancellationReason !== undefined)
      updateData.cancellationReason = data.cancellationReason;
    if (data.paymentStatus !== undefined)
      updateData.paymentStatus = data.paymentStatus;

    const updated = await this.prisma.amenityReservation.update({
      where: { id },
      data: updateData,
      include: this.standardIncludes,
    });

    return AmenityReservationMapper.toDomain(updated);
  }
}
