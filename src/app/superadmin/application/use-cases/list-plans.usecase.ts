import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class SuperadminListPlansUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute() {
    const plans = await this.prismaService.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { basePrice: 'asc' },
    });

    return plans.map((plan) => ({
      ...plan,
      basePrice: Number(plan.basePrice),
      extraHousePrice: Number(plan.extraHousePrice),
    }));
  }
}
