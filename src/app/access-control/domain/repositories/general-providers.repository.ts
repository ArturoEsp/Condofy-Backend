import {
  GeneralProviderAccessEntity,
  GeneralProviderCategory,
  GeneralProviderStatus,
} from '../entities/general-provider-access.entity';

export interface CreateGeneralProviderAccessProps {
  condominiumId: string;
  name: string;
  category: GeneralProviderCategory;
  driverName?: string;
  vehiclePlate?: string;
  companyPhone?: string;
  notes?: string;
  entryGuardId: string;
}

export interface ExitGeneralProviderAccessProps {
  id: string;
  exitGuardId: string;
  exitNotes?: string;
}

export interface ParamsFindGeneralProviders {
  condominiumId: string;
  status?: GeneralProviderStatus;
  category?: GeneralProviderCategory;
  search?: string;
  page?: number;
  size?: number;
}

export interface PaginatedGeneralProvidersResult {
  providers: GeneralProviderAccessEntity[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export abstract class GeneralProvidersRepository {
  abstract create(
    props: CreateGeneralProviderAccessProps,
  ): Promise<GeneralProviderAccessEntity>;
  abstract findById(id: string): Promise<GeneralProviderAccessEntity | null>;
  abstract findActive(
    condominiumId: string,
    search?: string,
  ): Promise<GeneralProviderAccessEntity[]>;
  abstract findHistory(
    params: ParamsFindGeneralProviders,
  ): Promise<PaginatedGeneralProvidersResult>;
  abstract registerExit(
    props: ExitGeneralProviderAccessProps,
  ): Promise<GeneralProviderAccessEntity>;
  abstract countActive(condominiumId: string): Promise<number>;
}
