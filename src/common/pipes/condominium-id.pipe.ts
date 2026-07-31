import { PipeTransform, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class CondominiumIdPipe implements PipeTransform<
  string,
  Promise<string>
> {
  constructor(private readonly prismaService: PrismaService) {}

  async transform(condominiumKey: string): Promise<string> {
    if (!condominiumKey) {
      throw new NotFoundException('Condominium key was not provided');
    }

    // Buscamos el registro por su key en la BD
    const condominium = await this.prismaService.condominium.findUnique({
      where: { key: condominiumKey },
    });

    if (!condominium) {
      throw new NotFoundException(
        `Condominium with key '${condominiumKey}' not found`,
      );
    }

    // Retornamos directamente el ID
    return condominium.id;
  }
}
