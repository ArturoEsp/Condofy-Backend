export interface ParamsListResidentsCommand {
  search?: string;
  page: number;
  size: number;
  orderBy?: 'asc' | 'desc';
}
