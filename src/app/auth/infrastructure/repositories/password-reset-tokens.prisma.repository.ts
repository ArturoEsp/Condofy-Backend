import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import PasswordResetTokensRepository, {
  CreatePasswordResetToken,
} from '../../domain/repositories/password-reset-tokens.repository';
import { PasswordResetTokenEntity } from '../../domain/entities/password-reset-token.entity';

@Injectable()
export class PasswordResetTokensPrismaRepository implements PasswordResetTokensRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreatePasswordResetToken,
  ): Promise<PasswordResetTokenEntity> {
    return await this.prisma.passwordResetToken.create({
      data,
    });
  }

  async findByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenEntity | null> {
    return await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  }

  async markAsUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async invalidateAllPendingForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });
  }
}
