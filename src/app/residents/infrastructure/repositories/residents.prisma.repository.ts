import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { ResidentEntity } from '../../domain/entities/resident.entity';
import ResidentsRepository, {
  CreateResident,
  ParamsFindMany,
} from '../../domain/repositories/residents.repository';
import { Injectable } from '@nestjs/common';
import { ResidentEntityMapper } from '../mappers/resident.mapper';

@Injectable()
export class ResidentsPrismaRepository implements ResidentsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateResident): Promise<ResidentEntity> {
    const resident = await this.prismaService.residentProfile.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        comments: data.comments,
        condominiumId: data.condominiumId,
        houseId: data.houseId,
        residentType: data.residentType,
        canCreateVisits: data.canCreateVisits ?? true,
        userId: data.userId,
      },
      include: { user: true, house: true },
    });

    return ResidentEntityMapper.toDomain(resident);
  }

  async update(
    id: string,
    data: Partial<CreateResident>,
  ): Promise<ResidentEntity> {
    const resident = await this.prismaService.residentProfile.update({
      where: { id },
      data: {
        ...data,
      },
      include: { user: true, house: true },
    });

    return ResidentEntityMapper.toDomain(resident);
  }

  async delete(id: string) {
    await this.prismaService.residentProfile.delete({ where: { id } });
  }

  async findOneById(id: string): Promise<ResidentEntity | null> {
    const resident = await this.prismaService.residentProfile.findUnique({
      where: { id },
      include: { user: true, house: true },
    });

    return resident ? ResidentEntityMapper.toDomain(resident) : null;
  }

  async findOneByUserId(userId: string): Promise<ResidentEntity | null> {
    const resident = await this.prismaService.residentProfile.findUnique({
      where: {
        userId,
      },
      include: { user: true, house: true },
    });

    return resident ? ResidentEntityMapper.toDomain(resident) : null;
  }

  async findManyByHouseId(houseId: string) {
    const residents = await this.prismaService.residentProfile.findMany({
      include: { user: true, house: true },
      where: { houseId },
    });

    return residents.map(ResidentEntityMapper.toDomain);
  }

  async findMany(params: Partial<ParamsFindMany>): Promise<ResidentEntity[]> {
    const { page, size, fullText, condominiumId, orderBy, houseId } = params;

    const residents = await this.prismaService.residentProfile.findMany({
      include: { user: true, house: true },
      where: {
        ...(condominiumId && { condominiumId }),
        ...(houseId && { houseId }),
        ...(fullText && {
          OR: [
            { firstName: { contains: fullText, mode: 'insensitive' } },
            { lastName: { contains: fullText, mode: 'insensitive' } },
            { phone: { contains: fullText, mode: 'insensitive' } },
            { user: { email: { contains: fullText, mode: 'insensitive' } } },
          ],
        }),
      },
      ...(orderBy && { orderBy: { createdAt: orderBy } }),
      ...(size && { take: size }),
      ...(page && { skip: (page - 1) * size }),
    });

    return residents.map(ResidentEntityMapper.toDomain);
  }

  async count(params: Partial<ParamsFindMany>) {
    const { fullText, condominiumId, houseId } = params;

    return await this.prismaService.residentProfile.count({
      where: {
        ...(condominiumId && { condominiumId }),
        ...(houseId && { houseId }),
        ...(fullText && {
          OR: [
            { firstName: { contains: fullText, mode: 'insensitive' } },
            { lastName: { contains: fullText, mode: 'insensitive' } },
            { phone: { contains: fullText, mode: 'insensitive' } },
            { user: { email: { contains: fullText, mode: 'insensitive' } } },
          ],
        }),
      },
    });
  }
}
