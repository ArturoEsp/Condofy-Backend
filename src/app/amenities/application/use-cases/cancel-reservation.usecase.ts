import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenityReservationStatus } from '@/core/infrastructure/persistence/prisma/generated/client';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityReservationEntity } from '../../domain/entities/amenity-reservation.entity';

@Injectable()
export class CancelReservationUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(params: {
    reservationId: string;
    condominiumId: string;
    cancelledByUserId: string;
    isResident: boolean;
    reason?: string;
  }): Promise<AmenityReservationEntity> {
    const reservation = await this.reservationsRepository.findById(
      params.reservationId,
      params.condominiumId,
    );

    if (!reservation) {
      throw new NotFoundException('La reservación solicitada no existe');
    }

    if (
      params.isResident &&
      reservation.residentId !== params.cancelledByUserId
    ) {
      throw new ForbiddenException(
        'No tienes permiso para cancelar una reservación que no te pertenece',
      );
    }

    if (
      reservation.status === AmenityReservationStatus.CANCELLED ||
      reservation.status === AmenityReservationStatus.REJECTED ||
      reservation.status === AmenityReservationStatus.COMPLETED
    ) {
      throw new BadRequestException(
        `No es posible cancelar una reservación con estatus ${reservation.status}`,
      );
    }

    return this.reservationsRepository.updateStatus(
      params.reservationId,
      params.condominiumId,
      {
        status: AmenityReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelledBy: params.cancelledByUserId,
        cancellationReason:
          params.reason?.trim() || 'Cancelado por el solicitante',
      },
    );
  }
}
