import {
  CreateMechanicData,
  Mechanic,
  UpdateMechanicData,
} from '../interfaces';

export abstract class MechanicAbstract {
  abstract findById(id: string): Promise<Mechanic | null>;
  abstract findBySlug(slug: string): Promise<Mechanic | null>;
  abstract findMany(params?: { isActive?: boolean }): Promise<Mechanic[]>;
  abstract create(data: CreateMechanicData): Promise<Mechanic>;
  abstract update(id: string, data: UpdateMechanicData): Promise<Mechanic>;
  abstract delete(id: string): Promise<void>;
}

export const MECHANIC_ABSTRACT = Symbol('MECHANIC_ABSTRACT');
