import {
  MechanicWorkLog,
  MechanicWorkLogProps,
} from '../entities/mechanic-work-log.entity';

export type CreateMechanicWorkLogData = Omit<
  MechanicWorkLogProps,
  'id' | 'createdAt'
>;

export abstract class MechanicWorkLogAbstract {
  abstract create(data: CreateMechanicWorkLogData): Promise<MechanicWorkLog>;
  abstract listByRequest(serviceRequestId: string): Promise<MechanicWorkLog[]>;
}

export const MECHANIC_WORK_LOG_REPOSITORY = Symbol(
  'MECHANIC_WORK_LOG_REPOSITORY',
);
