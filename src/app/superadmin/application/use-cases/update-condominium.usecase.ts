import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { SuperadminUpdateCondominiumCommand } from '../commands/update-condominium.command';

@Injectable()
export class SuperadminUpdateCondominiumUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(command: SuperadminUpdateCondominiumCommand) {
    const { id, ...data } = command;

    const exists = await this.prismaService.condominium.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Fraccionamiento no encontrado.');
    }

    const updated = await this.prismaService.condominium.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.googleMapsUrl !== undefined && {
          googleMapsUrl: data.googleMapsUrl,
        }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.contactPhone !== undefined && {
          contactPhone: data.contactPhone,
        }),
        ...(data.contactEmail !== undefined && {
          contactEmail: data.contactEmail,
        }),
        ...(data.planId !== undefined && { planId: data.planId }),
        ...(data.isTrial !== undefined && { isTrial: data.isTrial }),
        ...(data.customPriceOverride !== undefined && {
          customPriceOverride: data.customPriceOverride,
        }),
        ...(data.isDisabled !== undefined && { isDisabled: data.isDisabled }),
      },
    });

    return {
      ...updated,
      customPriceOverride:
        updated.customPriceOverride !== null && updated.customPriceOverride !== undefined
          ? Number(updated.customPriceOverride)
          : null,
    };
  }
}
