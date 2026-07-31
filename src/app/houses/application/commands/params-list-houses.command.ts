export interface ParamsListHousesCommand {
  search?: string;
  page: number;
  size: number;
  orderBy?: 'asc' | 'desc';
}
