export interface AmenityBlockPeriodProps {
  id: string;
  amenityId: string;
  condominiumId: string;
  title: string;
  reason?: string | null;
  startDate: Date;
  endDate: Date;
  startTime?: string | null;
  endTime?: string | null;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class AmenityBlockPeriodEntity {
  readonly id: string;
  readonly amenityId: string;
  readonly condominiumId: string;
  readonly title: string;
  readonly reason: string | null;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: AmenityBlockPeriodProps) {
    this.id = props.id;
    this.amenityId = props.amenityId;
    this.condominiumId = props.condominiumId;
    this.title = props.title;
    this.reason = props.reason ?? null;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.startTime = props.startTime ?? null;
    this.endTime = props.endTime ?? null;
    this.createdBy = props.createdBy ?? null;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
