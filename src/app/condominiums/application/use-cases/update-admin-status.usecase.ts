import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { UserStatus } from '@/core/infrastructure/persistence/prisma/generated/enums';

@Injectable()
export class UpdateAdminStatusUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(
    id: string,
    status: UserStatus,
    condominiumId: string,
    currentUserId: string,
  ) {
    if (id === currentUserId && status !== UserStatus.ACTIVE) {
      throw new BadRequestException(
        'No puedes suspender o desactivar tu propia cuenta de administrador.',
      );
    }

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
      data: { status },
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
