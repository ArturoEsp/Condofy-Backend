import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenityReservationStatus } from '@/core/infrastructure/persistence/prisma/generated/client';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityReservationEntity } from '../../domain/entities/amenity-reservation.entity';
import { UpdateReservationStatusCommand } from '../commands/update-reservation-status.command';

@Injectable()
export class UpdateReservationStatusUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(
    command: UpdateReservationStatusCommand,
  ): Promise<AmenityReservationEntity> {
    const existing = await this.reservationsRepository.findById(
      command.reservationId,
      command.condominiumId,
    );

    if (!existing) {
      throw new NotFoundException('La reservación solicitada no existe');
    }

    const now = new Date();
    const approvedAt =
      command.status === AmenityReservationStatus.APPROVED
        ? now
        : existing.approvedAt;
    const approvedBy =
      command.status === AmenityReservationStatus.APPROVED
        ? (command.approvedBy ?? existing.approvedBy)
        : existing.approvedBy;

    const cancelledAt =
      command.status === AmenityReservationStatus.CANCELLED ||
      command.status === AmenityReservationStatus.REJECTED
        ? now
        : existing.cancelledAt;
    const cancelledBy =
      command.status === AmenityReservationStatus.CANCELLED ||
      command.status === AmenityReservationStatus.REJECTED
        ? (command.cancelledBy ?? existing.cancelledBy)
        : existing.cancelledBy;

    return this.reservationsRepository.updateStatus(
      command.reservationId,
      command.condominiumId,
      {
        status: command.status,
        adminNotes:
          command.adminNotes !== undefined
            ? command.adminNotes?.trim() || null
            : existing.adminNotes,
        approvedAt,
        approvedBy,
        cancelledAt,
        cancelledBy,
        cancellationReason:
          command.cancellationReason !== undefined
            ? command.cancellationReason?.trim() || null
            : existing.cancellationReason,
        paymentStatus: command.paymentStatus ?? existing.paymentStatus,
      },
    );
  }
}
