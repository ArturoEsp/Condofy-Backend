import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import UserSessionRepository, {
  CreateUserSession,
} from '../../domain/repositories/user-session.repository';
import { UserSessionEntity } from '../../domain/entities/user-session.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSessionPrismaRepository implements UserSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserSession) {
    return await this.prisma.userSession.create({
      data,
    });
  }
  async update(data: Partial<UserSessionEntity>) {
    return await this.prisma.userSession.update({
      where: { id: data.id },
      data,
    });
  }

  async findManyByUserId(userId: string) {
    return await this.prisma.userSession.findMany({
      where: { userId },
    });
  }
  async findById(id: string) {
    return await this.prisma.userSession.findUnique({
      where: { id },
    });
  }

  async findSessionWithUser(id: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            condominium: true,
            residentProfile: {
              include: { condominium: true },
            },
          },
        },
      },
    });

    if (!session) return null;

    const condominium =
      session.user.condominium ||
      session.user.residentProfile?.condominium ||
      null;

    return {
      id: session.id,
      isRevoked: session.isRevoked,
      expiresAt: session.expiresAt,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        condominiumId: condominium?.id,
        condominiumKey: condominium?.key,
      },
    };
  }

  async delete(id: string) {
    await this.prisma.userSession.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string) {
    await this.prisma.userSession.deleteMany({
      where: { userId },
    });
  }
}
