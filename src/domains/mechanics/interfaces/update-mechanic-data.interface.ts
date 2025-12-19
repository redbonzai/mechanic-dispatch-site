import { CreateMechanicData } from './create-mechanic-data.interface';

export interface UpdateMechanicData extends Partial<CreateMechanicData> {
  isActive?: boolean;
}
