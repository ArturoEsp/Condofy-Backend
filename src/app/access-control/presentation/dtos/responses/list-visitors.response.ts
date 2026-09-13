import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { VisitorResponse } from './visitor.response';

export class ListVisitorsResponse {
  @ApiProperty({
    example: 5,
    description: 'Total de visitantes registrados en la casa',
  })
  @Expose()
  count: number;

  @ApiProperty({
    example: 1,
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

  @ApiProperty({
    type: [VisitorResponse],
    description: 'Lista de visitantes del hogar',
  })
  @Expose()
  @Type(() => VisitorResponse)
  visitors: VisitorResponse[];
}
