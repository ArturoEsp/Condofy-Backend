import {
  AccessAuthorization,
  AccessLog,
  Visitor,
} from '@/core/infrastructure/persistence/prisma/generated/client';
import { AccessAuthorizationEntity } from '../../domain/entities/access-authorization.entity';
import { VisitorEntityMapper } from './visitor.mapper';

export type AccessAuthorizationWithRelations = AccessAuthorization & {
  visitor?: Visitor;
  logs?: AccessLog[];
};

export class AccessAuthorizationEntityMapper {
  static toDomain(
    model: AccessAuthorizationWithRelations,
  ): AccessAuthorizationEntity {
    // Formato visual con relleno de ceros a 4 posiciones: ACC-0001, ACC-0100
    const code = `ACC-${String(model.index).padStart(4, '0')}`;

    // Obtener el último log para determinar el estado de check-in en condominio
    const lastLog =
      model.logs && model.logs.length > 0 ? model.logs[0] : undefined;
    const insideCondo = lastLog?.entryType === 'ENTRY';

    return {
      id: model.id,
      index: model.index,
      code,
      visitorId: model.visitorId,
      visitor: model.visitor
        ? VisitorEntityMapper.toDomain(model.visitor)
        : undefined,
      qrCode: model.qrCode,
      pin: model.qrCode,
      vehiclePlate: model.vehiclePlate,
      type: model.type,
      status: model.status,
      insideCondo,
      lastLog: lastLog
        ? {
            id: lastLog.id,
            entryType: lastLog.entryType,
            date: lastLog.date,
            observations: lastLog.observations,
          }
        : undefined,
      validFrom: model.validFrom,
      validUntil: model.validUntil,
      maxEntries: model.maxEntries,
      usedEntries: model.usedEntries,
      notes: model.notes,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
    };
  }
}
