import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { AccessAuthorizationResponse } from './access-authorization.response';

export class AccessControlKpisResponse {
  @ApiProperty({
    example: 8,
    description: 'Total de autorizaciones activas',
  })
  @Expose()
  active: number;

  @ApiProperty({
    example: 2,
    description:
      'Total de visitas con check-in activo (actualmente dentro del condominio)',
  })
  @Expose()
  insideCondo: number;

  @ApiProperty({
    example: 3,
    description: 'Total de autorizaciones pendientes / programadas',
  })
  @Expose()
  pending: number;

  @ApiProperty({
    example: 15,
    description: 'Total general de accesos registrados para la casa',
  })
  @Expose()
  total: number;
}

export class ListAccessAuthorizationsResponse {
  @ApiProperty({
    example: 10,
    description: 'Total de autorizaciones de acceso encontradas',
  })
  @Expose()
  count: number;

  @ApiProperty({
    example: 3,
    description: 'Total de páginas disponibles para la paginación',
  })
  @Expose()
  totalPages: number;

  @ApiProperty({
    example: 1,
    description: 'Página actual',
  })
  @Expose()
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de elementos por página',
  })
  @Expose()
  size: number;

  @ApiPropertyOptional({
    type: () => AccessControlKpisResponse,
    description: 'Métricas para las tarjetas KPI del frontend',
  })
  @Expose()
  @Type(() => AccessControlKpisResponse)
  kpis?: AccessControlKpisResponse;

  @ApiProperty({
    type: [AccessAuthorizationResponse],
    description: 'Lista de autorizaciones de acceso de la casa',
  })
  @Expose()
  @Type(() => AccessAuthorizationResponse)
  authorizations: AccessAuthorizationResponse[];
}
