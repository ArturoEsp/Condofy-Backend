import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PROVIDES_NAMES } from '@/common/enums/provides-names.enums';
import {
  AmenityReservationStatus,
  AmenityPaymentStatus,
  AmenityReservationType,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { AmenitiesRepository } from '../../domain/repositories/amenities.repository';
import { AmenityReservationsRepository } from '../../domain/repositories/amenity-reservations.repository';
import { AmenityReservationEntity } from '../../domain/entities/amenity-reservation.entity';
import { CreateReservationCommand } from '../commands/create-reservation.command';

@Injectable()
export class RequestReservationUseCase {
  constructor(
    @Inject(PROVIDES_NAMES.AmenitiesRepository)
    private readonly amenitiesRepository: AmenitiesRepository,
    @Inject(PROVIDES_NAMES.AmenityReservationsRepository)
    private readonly reservationsRepository: AmenityReservationsRepository,
  ) {}

  async execute(
    command: CreateReservationCommand,
  ): Promise<AmenityReservationEntity> {
    const amenity = await this.amenitiesRepository.findById(
      command.amenityId,
      command.condominiumId,
    );

    if (!amenity) {
      throw new NotFoundException('La amenidad solicitada no existe');
    }

    if (!amenity.isActive) {
      throw new BadRequestException(
        'Esta amenidad se encuentra temporalmente inactiva',
      );
    }

    const now = new Date();
    const targetDate = new Date(command.reservationDate);

    // Validar anticipación mínima requerida
    const minNoticeMs = amenity.minNoticeHours * 60 * 60 * 1000;
    const bookingDateTime = new Date(targetDate);
    if (command.startTime) {
      const [h, m] = command.startTime.split(':').map(Number);
      bookingDateTime.setHours(h || 0, m || 0, 0, 0);
    } else {
      bookingDateTime.setHours(0, 0, 0, 0);
    }

    if (bookingDateTime.getTime() < now.getTime() + minNoticeMs) {
      throw new BadRequestException(
        `Esta amenidad requiere al menos ${amenity.minNoticeHours} horas de anticipación para reservarse`,
      );
    }

    // Validar horizonte máximo futuro
    const maxFutureMs = amenity.maxNoticeDays * 24 * 60 * 60 * 1000;
    if (bookingDateTime.getTime() > now.getTime() + maxFutureMs) {
      throw new BadRequestException(
        `No es posible reservar con más de ${amenity.maxNoticeDays} días de anticipación`,
      );
    }

    // Validar día de la semana permitido (0 = Domingo, ..., 6 = Sábado)
    const dayOfWeek = targetDate.getDay();
    if (
      Array.isArray(amenity.availableDays) &&
      amenity.availableDays.length > 0 &&
      !amenity.availableDays.includes(dayOfWeek)
    ) {
      throw new BadRequestException(
        'La amenidad no se encuentra disponible para su uso en el día de la semana seleccionado',
      );
    }

    // Validar horarios si es tipo PER_TIME_SLOT
    if (amenity.reservationType === AmenityReservationType.PER_TIME_SLOT) {
      if (!command.startTime || !command.endTime) {
        throw new BadRequestException(
          'Debes seleccionar una hora de inicio y una hora de término para esta amenidad',
        );
      }

      if (command.startTime >= command.endTime) {
        throw new BadRequestException(
          'La hora de inicio debe ser anterior a la hora de término',
        );
      }

      if (amenity.openingTime && command.startTime < amenity.openingTime) {
        throw new BadRequestException(
          `El horario de inicio no puede ser anterior a la apertura (${amenity.openingTime})`,
        );
      }

      if (amenity.closingTime && command.endTime > amenity.closingTime) {
        throw new BadRequestException(
          `El horario de término no puede ser posterior al cierre (${amenity.closingTime})`,
        );
      }

      if (amenity.maxHoursPerReservation) {
        const [startH, startM] = command.startTime.split(':').map(Number);
        const [endH, endM] = command.endTime.split(':').map(Number);
        const durationHours = endH - startH + (endM - startM) / 60;
        if (durationHours > amenity.maxHoursPerReservation) {
          throw new BadRequestException(
            `La duración máxima permitida para esta amenidad es de ${amenity.maxHoursPerReservation} hora(s)`,
          );
        }
      }
    }

    // Comprobar si existe bloqueo de calendario para esa fecha
    const blocks = await this.amenitiesRepository.findBlocks(
      amenity.id,
      command.condominiumId,
      targetDate,
      targetDate,
    );

    if (blocks.length > 0) {
      const activeBlock = blocks[0];
      throw new ConflictException(
        `La amenidad no está disponible para esa fecha por: "${activeBlock.title}"`,
      );
    }

    // Comprobar colisiones con reservaciones existentes
    const overlapping =
      await this.reservationsRepository.findOverlappingReservations(
        amenity.id,
        targetDate,
        command.startTime,
        command.endTime,
      );

    if (overlapping.length > 0) {
      throw new ConflictException(
        'El horario o fecha seleccionada ya cuenta con una reservación aprobada o en proceso de revisión',
      );
    }

    // Determinar estatus inicial
    const initialStatus = amenity.requiresApproval
      ? AmenityReservationStatus.PENDING_APPROVAL
      : AmenityReservationStatus.APPROVED;

    const totalCost = Number(amenity.cost) || 0;
    const depositAmount = amenity.requiresDeposit
      ? Number(amenity.depositAmount) || 0
      : 0;

    return this.reservationsRepository.create({
      amenityId: amenity.id,
      condominiumId: command.condominiumId,
      residentId: command.residentId,
      houseId: command.houseId,
      reservationDate: targetDate,
      startTime: command.startTime ?? null,
      endTime: command.endTime ?? null,
      status: initialStatus,
      totalCost,
      depositAmount,
      paymentStatus:
        totalCost > 0 || depositAmount > 0
          ? AmenityPaymentStatus.PENDING
          : AmenityPaymentStatus.PAID,
      notes: command.notes?.trim() || null,
      adminNotes: null,
      approvedAt: !amenity.requiresApproval ? now : null,
      approvedBy: !amenity.requiresApproval ? 'SISTEMA_AUTOMATICO' : null,
      cancelledAt: null,
      cancelledBy: null,
      cancellationReason: null,
    });
  }
}
