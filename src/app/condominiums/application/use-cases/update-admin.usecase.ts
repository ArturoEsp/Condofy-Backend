import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { UpdateAdminRequest } from '../../presentation/dtos/requests/update-admin.request';

@Injectable()
export class UpdateAdminUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: string, condominiumId: string, dto: UpdateAdminRequest) {
    const admin = await this.prismaService.user.findFirst({
      where: {
        id,
        condominiumId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      throw new NotFoundException(
        'Administrador no encontrado en este condominio.',
      );
    }

    return await this.prismaService.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
