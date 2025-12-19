export interface MechanicWorkLogProps {
  id: string;
  serviceRequestId: string;
  mechanicName: string;
  hoursWorkedMinutes: number;
  payoutPercentage: number;
  notes?: string | null;
  createdAt: Date;
}

export class MechanicWorkLog {
  private constructor(private readonly props: MechanicWorkLogProps) {}

  static create(props: MechanicWorkLogProps): MechanicWorkLog {
    return new MechanicWorkLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get serviceRequestId(): string {
    return this.props.serviceRequestId;
  }

  get mechanicName(): string {
    return this.props.mechanicName;
  }

  get hoursWorkedMinutes(): number {
    return this.props.hoursWorkedMinutes;
  }

  get payoutPercentage(): number {
    return this.props.payoutPercentage;
  }

  get notes(): string | null | undefined {
    return this.props.notes ?? null;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}

export type CreateMechanicWorkLogData = Omit<
  MechanicWorkLogProps,
  'id' | 'createdAt'
>;

export abstract class MechanicWorkLogRepository {
  abstract create(data: CreateMechanicWorkLogData): Promise<MechanicWorkLog>;
  abstract listByRequest(serviceRequestId: string): Promise<MechanicWorkLog[]>;
}

export const MECHANIC_WORK_LOG_REPOSITORY = Symbol(
  'MECHANIC_WORK_LOG_REPOSITORY',
);
