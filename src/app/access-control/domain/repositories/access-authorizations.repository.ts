import {
  AuthorizationStatus,
  AuthorizationType,
} from '@/core/infrastructure/persistence/prisma/generated/enums';
import { AccessAuthorizationEntity } from '../entities/access-authorization.entity';

export interface CreateAccessAuthorizationData {
  visitorId: string;
  qrCode: string;
  vehiclePlate?: string | null;
  type: AuthorizationType;
  status: AuthorizationStatus;
  validFrom: Date;
  validUntil?: Date | null;
  maxEntries?: number | null;
  notes?: string | null;
}

export interface UpdateAccessAuthorizationData {
  status?: AuthorizationStatus;
  vehiclePlate?: string | null;
  validUntil?: Date | null;
  notes?: string | null;
}

export interface ParamsFindManyAccessAuthorizations {
  houseId: string;
  status?: AuthorizationStatus;
  type?: AuthorizationType;
  insideCondo?: boolean;
  search?: string;
  page: number;
  size: number;
  orderBy?: 'asc' | 'desc';
}

export interface ParamsCountAccessAuthorizations {
  houseId: string;
  status?: AuthorizationStatus;
  type?: AuthorizationType;
  insideCondo?: boolean;
  search?: string;
}

export interface AccessControlKpis {
  total: number;
  active: number;
  insideCondo: number;
  pending: number;
}

export default interface AccessAuthorizationsRepository {
  create(
    data: CreateAccessAuthorizationData,
  ): Promise<AccessAuthorizationEntity>;
  findOneById(id: string): Promise<AccessAuthorizationEntity | null>;
  findManyByHouseId(
    params: ParamsFindManyAccessAuthorizations,
  ): Promise<AccessAuthorizationEntity[]>;
  countByHouseId(params: ParamsCountAccessAuthorizations): Promise<number>;
  getKpisByHouseId(houseId: string): Promise<AccessControlKpis>;
  update(
    id: string,
    data: UpdateAccessAuthorizationData,
  ): Promise<AccessAuthorizationEntity>;
}
