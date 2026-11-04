import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TicketMetricsResponse {
  @ApiProperty({ description: 'Total de tickets registrados' })
  @Expose()
  total: number;

  @ApiProperty({ description: 'Tickets abiertos o en revisión' })
  @Expose()
  open: number;

  @ApiProperty({ description: 'Tickets en progreso o con proveedor' })
  @Expose()
  inProgress: number;

  @ApiProperty({ description: 'Tickets resueltos esperando cierre' })
  @Expose()
  resolved: number;

  @ApiProperty({ description: 'Tickets cerrados satisfactoriamente' })
  @Expose()
  closed: number;

  @ApiPropertyOptional({ description: 'Promedio de satisfacción (1 a 5 estrellas)' })
  @Expose()
  averageRating: number | null;

  @ApiProperty({ description: 'Desglose de tickets por categoría' })
  @Expose()
  byCategory: Record<string, number>;

  @ApiProperty({ description: 'Desglose de tickets por prioridad' })
  @Expose()
  byPriority: Record<string, number>;
}
