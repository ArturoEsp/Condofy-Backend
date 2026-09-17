import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class DeleteAdminUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(id: string, condominiumId: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new BadRequestException(
        'No puedes eliminar tu propia cuenta de administrador.',
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

    const totalAdmins = await this.prismaService.user.count({
      where: {
        condominiumId,
        role: 'ADMIN',
      },
    });

    if (totalAdmins <= 1) {
      throw new BadRequestException(
        'No es posible eliminar al único administrador del condominio.',
      );
    }

    await this.prismaService.user.delete({
      where: { id },
    });

    return { success: true, message: 'Administrador eliminado exitosamente.' };
  }
}
