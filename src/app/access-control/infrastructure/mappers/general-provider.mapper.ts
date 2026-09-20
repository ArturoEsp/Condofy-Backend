import { GeneralProviderAccessEntity } from '../../domain/entities/general-provider-access.entity';
import { PaginatedGeneralProvidersResult } from '../../domain/repositories/general-providers.repository';
import {
  GeneralProviderListResponse,
  GeneralProviderResponse,
} from '../../presentation/dtos/responses/general-provider.response';

export class GeneralProviderResponseMapper {
  static toResponse(
    entity: GeneralProviderAccessEntity,
  ): GeneralProviderResponse {
    return {
      id: entity.id,
      name: entity.name,
      category: entity.category,
      driverName: entity.driverName || undefined,
      vehiclePlate: entity.vehiclePlate || undefined,
      companyPhone: entity.companyPhone || undefined,
      notes: entity.notes || undefined,
      status: entity.status,
      enteredAt: entity.enteredAt,
      entryGuardId: entity.entryGuardId,
      entryGuard: entity.entryGuard
        ? {
            id: entity.entryGuard.id,
            email: entity.entryGuard.email,
            firstName: entity.entryGuard.firstName || undefined,
            lastName: entity.entryGuard.lastName || undefined,
          }
        : undefined,
      exitedAt: entity.exitedAt || undefined,
      exitGuardId: entity.exitGuardId || undefined,
      exitGuard: entity.exitGuard
        ? {
            id: entity.exitGuard.id,
            email: entity.exitGuard.email,
            firstName: entity.exitGuard.firstName || undefined,
            lastName: entity.exitGuard.lastName || undefined,
          }
        : undefined,
      exitNotes: entity.exitNotes || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  static toListResponse(
    result: PaginatedGeneralProvidersResult,
  ): GeneralProviderListResponse {
    return {
      providers: result.providers.map((p) => this.toResponse(p)),
      total: result.total,
      page: result.page,
      size: result.size,
      totalPages: result.totalPages,
    };
  }
}
