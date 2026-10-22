import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityReservationStatus } from '@/core/infrastructure/persistence/prisma/generated/client';

@Injectable()
export class DeleteReservationUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(reservationId: string, condominiumId: string): Promise<void> {
    const existing = await this.reservationsRepository.findById(
      reservationId,
      condominiumId,
    );

    if (!existing) {
      throw new NotFoundException('La reservación no existe');
    }

    if (
      existing.status !== AmenityReservationStatus.CANCELLED &&
      existing.status !== AmenityReservationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Solo se pueden eliminar reservaciones canceladas o rechazadas. Cancela la reservación antes de eliminarla.',
      );
    }

    await this.reservationsRepository.delete(reservationId, condominiumId);
  }
}
