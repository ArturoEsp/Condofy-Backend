import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import VisitorsRepository from '../../domain/repositories/visitors.repository';
import { ListHouseVisitorsCommand } from '../commands/list-house-visitors.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { VisitorEntity } from '../../domain/entities/visitor.entity';

export interface ListHouseVisitorsResult {
  count: number;
  totalPages: number;
  page: number;
  size: number;
  visitors: VisitorEntity[];
}

export class ListHouseVisitorsUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly visitorsRepository: VisitorsRepository,
  ) {}

  async execute(
    command: ListHouseVisitorsCommand,
  ): Promise<ListHouseVisitorsResult> {
    const resident = await this.residentsRepository.findOneByUserId(
      command.currentUserId,
    );

    if (!resident || resident.condominiumId !== command.condominiumId) {
      throw new ResidentNotFoundException();
    }

    if (!resident.houseId) {
      throw new ResidentHouseNotFoundException();
    }

    const page = command.page && command.page > 0 ? command.page : 1;
    const size = command.size && command.size > 0 ? command.size : 10;
    const orderBy = command.orderBy ?? 'desc';

    const [visitors, count] = await Promise.all([
      this.visitorsRepository.findMany({
        houseId: resident.houseId,
        search: command.search,
        category: command.category,
        page,
        size,
        orderBy,
      }),
      this.visitorsRepository.count({
        houseId: resident.houseId,
        search: command.search,
        category: command.category,
      }),
    ]);

    const totalPages = size > 0 ? Math.ceil(count / size) : 0;

    return {
      count,
      totalPages,
      page,
      size,
      visitors,
    };
  }
}
