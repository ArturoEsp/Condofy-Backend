import { ResidentWithHouse } from './resident-with-house.command';

export interface ListResidentsCommand {
  count: number;
  residents: ResidentWithHouse[];
}
