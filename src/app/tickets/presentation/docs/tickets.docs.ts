import { HttpStatus } from '@nestjs/common';
import { ApiEndpointProps } from '@/common/decorators/api-endpoint.decorator';
import {
  TicketResponse,
  PaginatedTicketsResponse,
  TicketCommentResponse,
} from '../dtos/responses/ticket.response';
import { TicketMetricsResponse } from '../dtos/responses/ticket-metrics.response';

export const createTicket: ApiEndpointProps = {
  summary: 'Crear un reporte de problema / ticket (máximo 3 fotos adjuntas)',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: TicketResponse,
  type: TicketResponse,
};

export const listTickets: ApiEndpointProps = {
  summary: 'Listar tickets (residentes ven sus reportes; administración ve todo el condominio)',
  status: HttpStatus.OK,
  withToken: true,
  serialization: PaginatedTicketsResponse,
  type: PaginatedTicketsResponse,
};

export const getTicketMetrics: ApiEndpointProps = {
  summary: 'Obtener métricas y estadísticas de tickets del condominio',
  status: HttpStatus.OK,
  withToken: true,
  serialization: TicketMetricsResponse,
  type: TicketMetricsResponse,
};

export const getTicketById: ApiEndpointProps = {
  summary: 'Obtener detalle de un ticket por ID',
  status: HttpStatus.OK,
  withToken: true,
  serialization: TicketResponse,
  type: TicketResponse,
};

export const updateTicketStatus: ApiEndpointProps = {
  summary: 'Actualizar estatus y prioridad de un ticket',
  status: HttpStatus.OK,
  withToken: true,
  serialization: TicketResponse,
  type: TicketResponse,
};

export const assignTicket: ApiEndpointProps = {
  summary: 'Asignar ticket a un administrador o proveedor externo',
  status: HttpStatus.OK,
  withToken: true,
  serialization: TicketResponse,
  type: TicketResponse,
};

export const addTicketComment: ApiEndpointProps = {
  summary: 'Agregar comentario o nota a un ticket',
  status: HttpStatus.CREATED,
  withToken: true,
  serialization: TicketCommentResponse,
  type: TicketCommentResponse,
};

export const rateTicket: ApiEndpointProps = {
  summary: 'Calificar atención del ticket (1 a 5 estrellas) y confirmar cierre',
  status: HttpStatus.OK,
  withToken: true,
  serialization: TicketResponse,
  type: TicketResponse,
};

