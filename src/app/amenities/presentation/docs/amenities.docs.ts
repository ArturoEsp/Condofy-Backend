import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import { AmenityResponse } from '../dtos/responses/amenity.response';
import { AmenitiesListResponse } from '../dtos/responses/amenities-list.response';
import { AmenityBlockPeriodResponse } from '../dtos/responses/amenity-block-period.response';
import { AmenityReservationResponse } from '../dtos/responses/amenity-reservation.response';
import { AmenityCalendarResponse } from '../dtos/responses/amenity-calendar.response';

export const createAmenityDoc: ApiEndpointProps = {
  summary:
    'Dar de alta una nueva amenidad con costos, reglamento y reglas de reservación (Admin)',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AmenityResponse,
  type: AmenityResponse,
};

export const getAdminAmenitiesDoc: ApiEndpointProps = {
  summary:
    'Listar todas las amenidades del condominio con conteo de reservas (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenitiesListResponse,
  type: AmenitiesListResponse,
};

export const getResidentAmenitiesDoc: ApiEndpointProps = {
  summary: 'Listar amenidades activas disponibles para residentes',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenitiesListResponse,
  type: AmenitiesListResponse,
};

export const getAmenityByIdDoc: ApiEndpointProps = {
  summary: 'Obtener detalle completo de una amenidad por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenityResponse,
  type: AmenityResponse,
};

export const updateAmenityDoc: ApiEndpointProps = {
  summary:
    'Actualizar configuración, costos, fotos o reglamento de una amenidad (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenityResponse,
  type: AmenityResponse,
};

export const deleteAmenityDoc: ApiEndpointProps = {
  summary: 'Eliminar una amenidad (Admin)',
  status: HttpStatus.OK,
  withToken: true,
};

export const createAmenityBlockDoc: ApiEndpointProps = {
  summary:
    'Registrar un bloqueo de fechas o mantenimiento en el calendario de la amenidad (Admin)',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AmenityBlockPeriodResponse,
  type: AmenityBlockPeriodResponse,
};

export const deleteAmenityBlockDoc: ApiEndpointProps = {
  summary: 'Eliminar un bloqueo de calendario de una amenidad (Admin)',
  status: HttpStatus.OK,
  withToken: true,
};

export const getAmenityCalendarDoc: ApiEndpointProps = {
  summary:
    'Consultar el calendario de disponibilidad, bloqueos y reservaciones de una amenidad',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenityCalendarResponse,
  type: AmenityCalendarResponse,
};

export const requestReservationDoc: ApiEndpointProps = {
  summary: 'Solicitar el apartado/renta de una amenidad (Residente o Admin)',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: AmenityReservationResponse,
  type: AmenityReservationResponse,
};

export const getAdminReservationsDoc: ApiEndpointProps = {
  summary:
    'Listar reservaciones del condominio con filtros de fecha, estatus o amenidad (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  type: [AmenityReservationResponse],
};

export const getResidentReservationsDoc: ApiEndpointProps = {
  summary:
    'Listar las reservaciones solicitadas por el residente o su vivienda',
  status: HttpStatus.OK,
  withToken: true,
  type: [AmenityReservationResponse],
};

export const updateReservationStatusDoc: ApiEndpointProps = {
  summary: 'Aprobar, rechazar o actualizar estatus de una reservación (Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenityReservationResponse,
  type: AmenityReservationResponse,
};

export const cancelReservationDoc: ApiEndpointProps = {
  summary: 'Cancelar una reservación (Residente o Admin)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: AmenityReservationResponse,
  type: AmenityReservationResponse,
};
