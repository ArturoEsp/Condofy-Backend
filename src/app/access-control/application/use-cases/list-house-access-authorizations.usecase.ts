import ResidentsRepository from '@/app/residents/domain/repositories/residents.repository';
import AccessAuthorizationsRepository, {
  AccessControlKpis,
} from '../../domain/repositories/access-authorizations.repository';
import { ListHouseAccessAuthorizationsCommand } from '../commands/list-house-access-authorizations.command';
import { ResidentNotFoundException } from '@/app/residents/application/use-cases/create-family-member.usecase';
import { ResidentHouseNotFoundException } from '@/app/residents/application/use-cases/get-my-house.usecase';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';

export interface ListHouseAccessAuthorizationsResult {
  count: number;
  totalPages: number;
  page: number;
  size: number;
  kpis: AccessControlKpis;
  authorizations: AccessAuthorizationEntity[];
}

export class ListHouseAccessAuthorizationsUseCase {
  constructor(
    private readonly residentsRepository: ResidentsRepository,
    private readonly accessAuthorizationsRepository: AccessAuthorizationsRepository,
  ) {}

  async execute(
    command: ListHouseAccessAuthorizationsCommand,
  ): Promise<ListHouseAccessAuthorizationsResult> {
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

    const [authorizations, count, kpis] = await Promise.all([
      this.accessAuthorizationsRepository.findManyByHouseId({
        houseId: resident.houseId,
        status: command.status,
        type: command.type,
        insideCondo: command.insideCondo,
        search: command.search,
        page,
        size,
        orderBy,
      }),
      this.accessAuthorizationsRepository.countByHouseId({
        houseId: resident.houseId,
        status: command.status,
        type: command.type,
        insideCondo: command.insideCondo,
        search: command.search,
      }),
      this.accessAuthorizationsRepository.getKpisByHouseId(resident.houseId),
    ]);

    const totalPages = size > 0 ? Math.ceil(count / size) : 0;

    return {
      count,
      totalPages,
      page,
      size,
      kpis,
      authorizations,
    };
  }
}
