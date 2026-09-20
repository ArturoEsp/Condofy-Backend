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

export interface ActiveEntryItemEntity {
  accessAuthorizationId: string;
  code: string;
  pin: string;
  type: string;
  status: string;
  vehiclePlate?: string | null;
  notes?: string | null;
  visitor?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    category: string;
    photo?: string | null;
    phone?: string | null;
  };
  house?: {
    id: string;
    houseNumber: string;
    tower?: string | null;
  };
  entryDate: Date;
  entryObservations?: string | null;
  entryLogId: string;
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

export interface ResidentAccessLogEntity {
  id: string;
  accessAuthorizationId: string;
  entryType: EntryType;
  observations?: string | null;
  date: Date;
  userAccept: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default interface AccessLogsRepository {
  create(data: CreateAccessLogData): Promise<AccessLogItemEntity>;
  findTodayLogs(params: ParamsFindAccessLogs): Promise<StandAccessLogsResult>;
  findActiveEntries(
    condominiumId: string,
    search?: string,
  ): Promise<ActiveEntryItemEntity[]>;
  getDashboardStats(condominiumId: string): Promise<StandDashboardStats>;
  findLogsByAuthorizationId(
    accessAuthorizationId: string,
  ): Promise<ResidentAccessLogEntity[]>;
}
