import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class SuperadminListCondominiumsUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute() {
    const condominiums = await this.prismaService.condominium.findMany({
      include: {
        plan: true,
        _count: {
          select: {
            houses: true,
            admins: { where: { role: 'ADMIN' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return condominiums.map((condo) => {
      const housesCount = condo._count.houses;
      let calculatedMonthlyPrice = 0;

      if (condo.customPriceOverride !== null && condo.customPriceOverride !== undefined) {
        calculatedMonthlyPrice = Number(condo.customPriceOverride);
      } else if (condo.isTrial || condo.plan?.code === 'TRIAL') {
        calculatedMonthlyPrice = 0;
      } else if (condo.plan) {
        const base = Number(condo.plan.basePrice);
        const extraPerHouse = Number(condo.plan.extraHousePrice);
        const included = condo.plan.includedHouses;
        const extraHouses = Math.max(0, housesCount - included);
        calculatedMonthlyPrice = base + extraHouses * extraPerHouse;
      }

      return {
        ...condo,
        customPriceOverride:
          condo.customPriceOverride !== null && condo.customPriceOverride !== undefined
            ? Number(condo.customPriceOverride)
            : null,
        plan: condo.plan
          ? {
              ...condo.plan,
              basePrice: Number(condo.plan.basePrice),
              extraHousePrice: Number(condo.plan.extraHousePrice),
            }
          : null,
        housesCount,
        adminsCount: condo._count.admins,
        calculatedMonthlyPrice,
      };
    });
  }
}
