import { EntryType } from '@/core/infrastructure/persistence/prisma/generated/enums';

export interface CreateAccessLogData {
  accessAuthorizationId: string;
  entryType: EntryType;
  observations?: string | null;
  userAcceptId: string;
}

export interface AccessLogItemEntity {
  id: string;
  accessAuthorizationId: string;
  entryType: EntryType;
  observations?: string | null;
  date: Date;
  userAccept: {
    id: string;
    email: string;
  };
  authorization: {
    id: string;
    code: string;
    pin: string;
    vehiclePlate?: string | null;
    type: string;
    status: string;
    notes?: string | null;
    visitor?: {
      firstName: string;
      lastName?: string | null;
      category: string;
      photo?: string | null;
      phone?: string | null;
    };
    house?: {
      houseNumber: string;
      tower?: string | null;
    };
  };
}

export interface StandDashboardStats {
  insideCount: number;
  todayEntriesCount: number;
  todayExitsCount: number;
}

export interface ParamsFindAccessLogs {
  condominiumId: string;
  date?: string; // YYYY-MM-DD
  entryType?: EntryType;
  search?: string;
  page?: number;
  size?: number;
}

export interface StandAccessLogsResult {
  logs: AccessLogItemEntity[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export default interface AccessLogsRepository {
  create(data: CreateAccessLogData): Promise<AccessLogItemEntity>;
  findTodayLogs(params: ParamsFindAccessLogs): Promise<StandAccessLogsResult>;
  getDashboardStats(condominiumId: string): Promise<StandDashboardStats>;
}
