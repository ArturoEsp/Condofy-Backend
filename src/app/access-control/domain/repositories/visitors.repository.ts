import { VisitorCategory } from '@/core/infrastructure/persistence/prisma/generated/enums';
import { VisitorEntity } from '../entities/visitor.entity';

export interface CreateVisitorData {
  houseId: string;
  firstName: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  photo?: string | null;
  category: VisitorCategory;
  vehiclePlate?: string | null;
  notes?: string | null;
}

export interface UpdateVisitorData {
  firstName?: string;
  lastName?: string | null;
  phone?: string | null;
  email?: string | null;
  photo?: string | null;
  category?: VisitorCategory;
  vehiclePlate?: string | null;
  notes?: string | null;
}

export interface ParamsFindManyVisitors {
  houseId: string;
  search?: string;
  category?: VisitorCategory;
  isActive?: boolean;
  page: number;
  size: number;
  orderBy?: 'asc' | 'desc';
}

export interface ParamsCountVisitors {
  houseId: string;
  search?: string;
  category?: VisitorCategory;
  isActive?: boolean;
}

export default interface VisitorsRepository {
  create(data: CreateVisitorData): Promise<VisitorEntity>;
  update(id: string, data: UpdateVisitorData): Promise<VisitorEntity>;
  findOneById(id: string): Promise<VisitorEntity | null>;
  findManyByHouseId(houseId: string): Promise<VisitorEntity[]>;
  findMany(params: ParamsFindManyVisitors): Promise<VisitorEntity[]>;
  count(params: ParamsCountVisitors): Promise<number>;
  countAuthorizations(visitorId: string): Promise<number>;
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}
