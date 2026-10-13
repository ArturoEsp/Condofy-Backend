import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { SuperadminDeleteAdminCommand } from '../commands/delete-admin.command';

@Injectable()
export class SuperadminDeleteAdminUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: SuperadminDeleteAdminCommand) {
    const { adminId, condominiumId } = command;
    const admin = await this.prismaService.user.findFirst({
      where: { id: adminId, condominiumId, role: 'ADMIN' },
    });

    if (!admin) {
      throw new NotFoundException(
        'Administrador no encontrado en este condominio.',
      );
    }

    const totalAdmins = await this.prismaService.user.count({
      where: { condominiumId, role: 'ADMIN' },
    });

    if (totalAdmins <= 1) {
      throw new BadRequestException(
        'No es posible eliminar al único administrador del condominio.',
      );
    }

    await this.prismaService.user.delete({ where: { id: adminId } });

    return { success: true, message: 'Administrador eliminado exitosamente.' };
  }
}
