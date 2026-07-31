import { ListResidentsCommand } from '@/app/residents/application/commands/list-residents.command';
import { ResidentWithHouseResponse } from './resident.response';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ListResidentsResponse implements ListResidentsCommand {
  @ApiProperty()
  @Expose()
  count: number;

  @ApiProperty()
  @Expose()
  residents: ResidentWithHouseResponse[];
}
