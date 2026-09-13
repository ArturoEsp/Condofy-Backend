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

export interface ParamsFindManyVisitors {
  houseId: string;
  search?: string;
  category?: VisitorCategory;
  page: number;
  size: number;
  orderBy?: 'asc' | 'desc';
}

export interface ParamsCountVisitors {
  houseId: string;
  search?: string;
  category?: VisitorCategory;
}

export default interface VisitorsRepository {
  create(data: CreateVisitorData): Promise<VisitorEntity>;
  findOneById(id: string): Promise<VisitorEntity | null>;
  findManyByHouseId(houseId: string): Promise<VisitorEntity[]>;
  findMany(params: ParamsFindManyVisitors): Promise<VisitorEntity[]>;
  count(params: ParamsCountVisitors): Promise<number>;
}
