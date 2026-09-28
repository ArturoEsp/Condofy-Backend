import { StandContactEntity } from '../entities/stand-contact.entity';

export interface CreateStandContactData {
  condominiumId: string;
  name: string;
  phoneNumber: string;
  extension?: string | null;
  schedule?: string | null;
  hasWhatsapp?: boolean;
  isPrimary?: boolean;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateStandContactData {
  name?: string;
  phoneNumber?: string;
  extension?: string | null;
  schedule?: string | null;
  hasWhatsapp?: boolean;
  isPrimary?: boolean;
  notes?: string | null;
  isActive?: boolean;
}

export interface StandContactsRepository {
  create(data: CreateStandContactData): Promise<StandContactEntity>;
  findById(id: string): Promise<StandContactEntity | null>;
  findManyByCondominium(
    condominiumId: string,
    onlyActive?: boolean,
  ): Promise<StandContactEntity[]>;
  update(id: string, data: UpdateStandContactData): Promise<StandContactEntity>;
  delete(id: string): Promise<void>;
  unsetPrimary(condominiumId: string, excludeId?: string): Promise<void>;
  countByCondominium(condominiumId: string): Promise<number>;
}

export default StandContactsRepository;
